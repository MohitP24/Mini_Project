#!/bin/bash
# Generates RS256 keys for testing
mkdir -p secrets
ssh-keygen -t rsa -b 2048 -m PEM -f secrets/sentinel_private_key.pem -q -N ""
openssl rsa -in secrets/sentinel_private_key.pem -pubout -outform PEM -out secrets/sentinel_public_key.pem
echo "RSA keys generated in secrets/"
