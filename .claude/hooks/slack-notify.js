#!/usr/bin/env node
// Claude Code Hooks → Slack Webhook 알림 스크립트
// 사용법: node slack-notify.js <Notification|Stop>
// stdin으로 JSON 데이터 수신

const https = require('https');
const fs = require('fs');
const path = require('path');

// .claude-env 파일 파싱 (외부 패키지 없이)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.claude-env');
  try {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  } catch (_) {
    // 파일 없으면 환경변수에서 직접 시도
  }
}

// Slack Block Kit 메시지 생성
function buildPayload(hookType, data) {
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  if (hookType === 'Notification') {
    // 권한 요청 알림
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔔 Claude Code 알림',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*프로젝트*\nclaude-nextjs-starterkits',
            },
            {
              type: 'mrkdwn',
              text: `*시간*\n${now}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*내용*\n${data.message ?? '권한 요청 또는 주의 필요'}`,
          },
        },
      ],
    };
  }

  // Stop 이벤트: 작업 완료 알림
  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✅ Claude Code 작업 완료',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*프로젝트*\nclaude-nextjs-starterkits',
          },
          {
            type: 'mrkdwn',
            text: `*완료 시간*\n${now}`,
          },
          {
            type: 'mrkdwn',
            text: `*이벤트명*\n${data.hook_event_name}`,
          },
        ],
      },
    ],
  };
}

// Slack Webhook으로 POST
async function postToSlack(webhookUrl, payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const url = new URL(webhookUrl);

    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        res.resume(); // 응답 바디 소비
        resolve(res.statusCode);
      }
    );

    req.on('error', () => resolve(null)); // 실패해도 블록 안 됨
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    }); // 5초 타임아웃

    req.write(body);
    req.end();
  });
}

// 메인 함수
async function main() {
  loadEnv();

  const hookType = process.argv[2];
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  // Webhook URL 없으면 조용히 종료
  if (!webhookUrl) {
    process.exit(0);
  }

  // stdin에서 JSON 데이터 수신
  let rawData = '';
  process.stdin.setEncoding('utf8');

  for await (const chunk of process.stdin) {
    rawData += chunk;
  }

  // JSON 파싱
  let data = {};
  try {
    data = JSON.parse(rawData || '{}');
  } catch (_) {
    process.exit(0); // JSON 파싱 실패해도 계속 진행
  }

  // 메시지 포맷팅
  const payload = buildPayload(hookType, data);

  // Slack 전송
  try {
    await postToSlack(webhookUrl, payload);
  } catch (_) {
    // Slack 전송 실패해도 Claude Code는 블록 안 됨
  }

  // 항상 exit 0 (중요!)
  process.exit(0);
}

main().catch(() => process.exit(0));
