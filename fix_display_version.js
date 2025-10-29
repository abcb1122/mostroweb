export async function showVersion() {
  const { APP_VERSION, APP_NAME, ENVIRONMENT } = await import('../utils/constants.js');

  addHTML(`
    <div class="box">
      <div class="box-title">\${APP_NAME} Version Information</div>
      <div class="box-content">
        Version: <strong>\${APP_VERSION}</strong><br>
        Build Date: \${ENVIRONMENT.buildDate}<br>
        Environment: \${ENVIRONMENT.isDevelopment ? 'Development' : 'Production'}<br>
        Protocol: Mostro P2P v1<br>
