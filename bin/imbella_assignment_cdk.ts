#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ImbellaAssignmentCdkStack } from '../lib/imbella_assignment_cdk-stack';

import { Route53Client, ListHostedZonesByNameCommand } from '@aws-sdk/client-route-53';

const app = new cdk.App();

const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION 
};

const r53Client = new Route53Client({
  region: env.region
});

const command = new ListHostedZonesByNameCommand({
  DNSName: 'kevinr.net'
});

r53Client.send(command).then((response) => {
  const hostedZoneId = response.HostedZones?.find((zone) => zone.Name?.includes('kevinr.net'))?.Id?.split('/')[2];

  const app = new cdk.App();
  new ImbellaAssignmentCdkStack(app, 'ImbellaAssignmentCdkStack', {
      env,
      hostedZoneId: hostedZoneId as string
  });
});
