#!/usr/bin/env node

/**
 * Stripe Setup Validation Script
 * 
 * This script validates your Stripe configuration and tests the setup
 * Run with: node scripts/test-stripe-setup.js
 */

const stripe = require('stripe');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logSection(title) {
  console.log('\n' + colors.bold + colors.blue + '='.repeat(50));
  console.log(`  ${title}`);
  console.log('='.repeat(50) + colors.reset);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function validateEnvironmentVariables() {
  logSection('Environment Variables Validation');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID',
    'NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID',
    'NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID',
    'STRIPE_WEBHOOK_SECRET'
  ];

  let allValid = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      logError(`Missing environment variable: ${varName}`);
      allValid = false;
    } else {
      // Validate format
      let isValid = true;
      let expectedFormat = '';

      switch (varName) {
        case 'STRIPE_SECRET_KEY':
          expectedFormat = 'sk_test_... or sk_live_...';
          isValid = value.startsWith('sk_test_') || value.startsWith('sk_live_');
          break;
        case 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY':
          expectedFormat = 'pk_test_... or pk_live_...';
          isValid = value.startsWith('pk_test_') || value.startsWith('pk_live_');
          break;
        case 'NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID':
        case 'NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID':
        case 'NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID':
          expectedFormat = 'price_...';
          isValid = value.startsWith('price_');
          break;
        case 'STRIPE_WEBHOOK_SECRET':
          expectedFormat = 'whsec_...';
          isValid = value.startsWith('whsec_');
          break;
      }

      if (isValid) {
        logSuccess(`${varName}: Valid format`);
      } else {
        logError(`${varName}: Invalid format (expected: ${expectedFormat})`);
        allValid = false;
      }
    }
  }

  return allValid;
}

async function validateStripeConnection() {
  logSection('Stripe API Connection Test');

  try {
    const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
    
    // Test basic API connection
    const account = await stripeClient.accounts.retrieve();
    logSuccess(`Connected to Stripe account: ${account.display_name || account.id}`);
    
    // Check if in test mode
    const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    if (isTestMode) {
      logWarning('Using TEST mode - Remember to switch to LIVE mode for production');
    } else {
      logInfo('Using LIVE mode');
    }

    return { success: true, stripe: stripeClient };
  } catch (error) {
    logError(`Failed to connect to Stripe: ${error.message}`);
    return { success: false };
  }
}

async function validateProducts(stripeClient) {
  logSection('Product Validation');

  const priceIds = [
    { name: 'PRO', id: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID },
    { name: 'BUSINESS', id: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID },
    { name: 'ENTERPRISE', id: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID }
  ];

  let allValid = true;

  for (const { name, id } of priceIds) {
    try {
      const price = await stripeClient.prices.retrieve(id);
      const product = await stripeClient.products.retrieve(price.product);
      
      logSuccess(`${name} Plan Found:`);
      logInfo(`  Product: ${product.name}`);
      logInfo(`  Price: $${price.unit_amount / 100}/${price.recurring.interval}`);
      logInfo(`  Status: ${product.active ? 'Active' : 'Inactive'}`);
      
      if (!product.active) {
        logWarning(`  ${name} product is inactive - activate it in Stripe dashboard`);
      }

    } catch (error) {
      logError(`${name} Plan Error: ${error.message}`);
      allValid = false;
    }
  }

  return allValid;
}

async function validateWebhookEndpoint() {
  logSection('Webhook Configuration Test');

  try {
    const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
    const webhookEndpoints = await stripeClient.webhookEndpoints.list();
    
    // Look for our webhook endpoint
    const appEndpoints = webhookEndpoints.data.filter(endpoint => 
      endpoint.url.includes('/api/webhooks/stripe')
    );

    if (appEndpoints.length === 0) {
      logWarning('No webhook endpoints found for /api/webhooks/stripe');
      logInfo('You need to create a webhook endpoint in the Stripe dashboard');
      return false;
    }

    for (const endpoint of appEndpoints) {
      logSuccess(`Webhook endpoint found: ${endpoint.url}`);
      logInfo(`  Status: ${endpoint.status}`);
      logInfo(`  Events: ${endpoint.enabled_events.length} configured`);
      
      // Check for required events
      const requiredEvents = [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed'
      ];

      const missingEvents = requiredEvents.filter(event => 
        !endpoint.enabled_events.includes(event)
      );

      if (missingEvents.length > 0) {
        logWarning(`  Missing events: ${missingEvents.join(', ')}`);
      } else {
        logSuccess('  All required events configured');
      }
    }

    return true;
  } catch (error) {
    logError(`Webhook validation failed: ${error.message}`);
    return false;
  }
}

async function generateTestData() {
  logSection('Test Data Generation');

  const testCustomerData = {
    email: 'test@example.com',
    name: 'Test Customer',
    payment_method: '4242424242424242', // Test card
  };

  logInfo('Test customer data for manual testing:');
  logInfo(`  Email: ${testCustomerData.email}`);
  logInfo(`  Name: ${testCustomerData.name}`);
  logInfo(`  Test Card: ${testCustomerData.payment_method}`);
  
  logInfo('\nTest subscription URLs:');
  logInfo(`  PRO: Create subscription with price ID ${process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID}`);
  logInfo(`  BUSINESS: Create subscription with price ID ${process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID}`);
  logInfo(`  ENTERPRISE: Create subscription with price ID ${process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID}`);
}

async function main() {
  log('\n🔍 Stripe Setup Validation Tool', 'bold');
  log('=====================================\n');

  try {
    // Step 1: Validate environment variables
    const envValid = await validateEnvironmentVariables();
    if (!envValid) {
      logError('\n❌ Environment validation failed. Fix the issues above and try again.');
      process.exit(1);
    }

    // Step 2: Test Stripe connection
    const { success, stripe: stripeClient } = await validateStripeConnection();
    if (!success) {
      logError('\n❌ Stripe connection failed. Check your API keys.');
      process.exit(1);
    }

    // Step 3: Validate products
    const productsValid = await validateProducts(stripeClient);
    if (!productsValid) {
      logError('\n❌ Product validation failed. Check your price IDs.');
      process.exit(1);
    }

    // Step 4: Validate webhook setup
    await validateWebhookEndpoint();

    // Step 5: Generate test data
    await generateTestData();

    // Summary
    logSection('Validation Summary');
    logSuccess('✅ Environment variables are valid');
    logSuccess('✅ Stripe API connection works');
    logSuccess('✅ All subscription products found');
    logInfo('ℹ️  Webhook validation completed (check warnings above)');
    
    logInfo('\n🎉 Your Stripe setup looks good!');
    logInfo('Next steps:');
    logInfo('1. Test subscription flow in your app');
    logInfo('2. Verify webhook delivery works');
    logInfo('3. Test with real payment methods');

  } catch (error) {
    logError(`\n💥 Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run the validation
main().catch(console.error);