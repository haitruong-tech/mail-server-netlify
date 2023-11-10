#!/bin/bash
path=portfolio-db.json

if [ -f $path ]; then
  rm $path
fi

echo "{" >>$path
echo "  \"type\": \"${TYPE}\"," >>$path
echo "  \"project_id\": \"${PROJECT_ID}\"," >>$path
echo "  \"private_key_id\": \"${PRIVATE_KEY_ID}\"," >>$path
echo "  \"private_key\": \"${PRIVATE_KEY}\"," >>$path
echo "  \"client_email\": \"${CLIENT_EMAIL}\"," >>$path
echo "  \"client_id\": \"${CLIENT_ID}\"," >>$path
echo "  \"auth_uri\": \"${AUTH_URI}\"," >>$path
echo "  \"token_uri\": \"${TOKEN_URI}\"," >>$path
echo "  \"auth_provider_x509_cert_url\": \"${AUTH_PROVIDER_X509_CERT_URL}\"," >>$path
echo "  \"client_x509_cert_url\": \"${CLIENT_X509_CERT_URL}\"," >>$path
echo "  \"universe_domain\": \"${UNIVERSE_DOMAIN}\"" >>$path
echo "}" >>$path
