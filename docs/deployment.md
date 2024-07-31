### Setting up Infra

You can deploy your application on an AWS S3 bucket and connect it to a CloudFront distribution using the CDK stack in the `infra` folder.


You can find a Github Action in the `.github/workflows` folder called `publish.yml` which deploys your application everytime changes are pushed to the main branch. You need to set the following environment variables by creating a `.env.prod` file in the root folder. Fill in the .env.prod using the values mentioned in [env/.env.prod.template](../env/.env.prod.template).
After this, on committing, it will automatically trigger a deployment action and deploy your stack.
Note: The Github Action includes a step for creating invalidation for the cloudfront distribution. This step requires permissions so ensure that your AWS credentials have the required permissions. You can refer to the permissions required for creating invalidation [here](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/access-control-managing-permissions.html#access-policy-example-allow-create-list-invalidations).

You can also deploy it from terminal:

* run `export $(cat .env.prod | xargs)`
* run `npm run build` to generate the build folder.
* run `bash scripts/deploy.sh` to deploy

### Connecting a secure domain to Cloudfront
By default the template only creates and outputs a cloudfront distrubution URL, but we also include commented code to connect your own domains. 
Note: you will need to provide a valid SSL certificate for your domain

## Removing the Deployment
1. Run the following command
```commandline
bash scripts/destroy.sh
```