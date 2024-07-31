export $(cat .env | xargs)
npm run build
cd infrastructure
npm install
cdk destroy --all --require-approval never
