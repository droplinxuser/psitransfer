const path = require('path');
const fs = require('fs');
const fsp = require('fs-promise');

// Default Config
// Do not edit this, generate a config.<ENV>.js for your NODE_ENV
// or use ENV-VARS like PSITRANSFER_PORT=8000
const config = {
  "uploadDir": '/var/www/psi_data',
  // set to serve PsiTransfer from a sub-path
  "baseUrl": '/',
  // use to set custom upload url (subfolder to baseUrl)
  "uploadAppPath": '/',
  "iface": '127.0.0.1',
  // set to false to disable HTTP
  "port": 3000,
  // HTTPS, set all 3 values to enable
  "sslPort": 8443,
  "sslKeyFile": false,
  "sslCertFile": false,
  // Force redirect to https
  // can be true or a specific url like https://example.com:8443
  // keep empty to disable
  "forceHttps": '',
  // Use trust proxy to show real IP on logs when reverse proxy are used
  // see https://expressjs.com/en/guide/behind-proxies.html for options
  "trustProxy": '',
  // retention options in seconds:label
  "retentions": {
    "one-time": "one time download",
    "3600": "1 Hour",
    "86400": "1 Day",
    "604800": "1 Week",
    "2630000": "1 Month",
    "15780000": "6 Months",
    "31536000": "1 Year"
  },
  // admin password, set to false to disable /admin page
  // to enable /admin page set your password like this:
  // "adminPass": "YourSecurePassword",
  "adminPass": false,
  // upload password, set to false to disable
  "uploadPass": false,
  // make the bucket-password field mandatory
  "requireBucketPassword": false,
  "defaultRetention": "86400",
  // expire every file after maxAge (eg never downloaded one-time files)
  "maxAge": 3600 * 24 * 365, // 365 days or 1 year
  // maximum file-size for previews in byte
  "maxPreviewSize": Math.pow(1, 1) * 1, // 1Byte
  "mailTemplate": 'mailto:?subject=File Transfer&body=You can download the files here: %%URL%%',
  // see https://github.com/expressjs/morgan
  // set to false to disable logging
  "accessLog": false,
  // event webhooks
  // invokes an HTTP POST to a url whenever a file is downloaded
  // for more info, see the webhooks section of docs/configuration.md
  "fileDownloadedWebhook": null,
  "fileUploadedWebhook": null,
  // Fallback language
  "defaultLanguage": "en",
  // Limit upload size
  "maxFileSize": Math.pow(2, 29), // 512MB
  "maxBucketSize": Math.pow(2, 29), // 512MB
  "plugins": ['file-downloaded-webhook', 'file-uploaded-webhook'],
  // Disable the QR code button for download url sharing, set to true to disable
  "disableQrCode": false,
};

// Load NODE_ENV specific config
const envConfFile = path.resolve(__dirname, `config.${ process.env.NODE_ENV }.js`);
if (process.env.NODE_ENV && fsp.existsSync(envConfFile)) {
  Object.assign(config, require(envConfFile));
}

// Load config from ENV VARS
let envName;
for (let k in config) {
  envName = 'PSITRANSFER_' + k.replace(/([A-Z])/g, $1 => "_" + $1).toUpperCase();
  if (process.env[envName]) {
    if (typeof config[k] === 'number') {
      config[k] = parseInt(process.env[envName], 10);
    } else if (Array.isArray(config[k])) {
      config[k] = process.env[envName].split(',');
    } else if (typeof config[k] === 'object') {
      config[k] = JSON.parse(process.env[envName]);
    } else {
      config[k] = process.env[envName];
    }
  }
}

if (!config.baseUrl.endsWith('/')) config.baseUrl = config.baseUrl + '/';
if (!config.uploadAppPath.endsWith('/')) config.uploadAppPath = config.uploadAppPath + '/';

config.uploadAppPath = config.baseUrl.substr(0, config.baseUrl.length - 1) + config.uploadAppPath;

// Load language files
config.languages = {
  [config.defaultLanguage]: require(`./lang/${ config.defaultLanguage }`) // default language
};
fs.readdirSync(path.resolve(__dirname, 'lang')).forEach(lang => {
  lang = lang.replace('.js', '');
  if (lang === config.defaultLanguage) return;
  config.languages[lang] = {
    ...config.languages[config.defaultLanguage],
    ...require(`./lang/${ lang }`)
  };
});

module.exports = config;
