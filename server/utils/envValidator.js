export function validateRequiredEnvVars() {
  const required = ['MONGODB_URI', 'OPENAI_API_KEY', 'PERPLEXITY_API_KEY'];
  const missing = [];
  const warnings = [];

  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (!process.env.ADMIN_API_KEY && !process.env.ADMIN_TOKEN) {
    warnings.push('ADMIN_API_KEY not set - admin endpoints will be unprotected');
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(`❌ ${message}`);
    console.error('Please set these variables in your .env file or environment.');
    throw new Error(message);
  }

  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`⚠️ Warning: ${w}`));
  }

  console.log('✓ All required environment variables are configured');
}

export function validateAIIntegrations() {
  const issues = [];

  if (!process.env.OPENAI_API_KEY) {
    issues.push('OPENAI_API_KEY is required for blog post generation');
  }

  if (!process.env.PERPLEXITY_API_KEY) {
    issues.push('PERPLEXITY_API_KEY is required for trend analysis');
  }

  if (issues.length > 0) {
    console.warn('⚠️ AI Integration issues:');
    issues.forEach(issue => console.warn(`   - ${issue}`));
    return false;
  }

  return true;
}
