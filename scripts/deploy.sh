cd infrastructure
npm install
touch output.json
./node_modules/.bin/cdk deploy --require-approval=never --outputs-file output.json
cd ..
