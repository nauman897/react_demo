cd infrastructure
export AWS_BUCKET=$(jq -r .[].AWSBUCKET output.json)
export AWS_DISTRIBUTION_ID=$(jq -r .[].AWSDISTRIBUTIONID output.json)
cd ..
npm install -g aws-cli
npm run build
aws s3 sync build s3://$AWS_BUCKET
aws cloudfront create-invalidation --distribution-id $AWS_DISTRIBUTION_ID --paths "/*"