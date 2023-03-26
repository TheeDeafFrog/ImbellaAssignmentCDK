import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface ImbellaAssignmentCdkStackProps extends cdk.StackProps {
  hostedZoneId: string;
}

export class ImbellaAssignmentCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ImbellaAssignmentCdkStackProps) {
    super(scope, id, props);

    const prodBucket = new cdk.aws_s3.Bucket(this, 'ProdBucket', {
      bucketName: 'imbella.kevinr.net',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const hostedZone = cdk.aws_route53.HostedZone.fromHostedZoneAttributes(this, 'KevinrNetHostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: 'kevinr.net'
    });

    const certificate = new cdk.aws_certificatemanager.Certificate(this, 'Certificates', {
      domainName: 'imbella.kevinr.net',
      validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
    });

    const prodDistribution = new cdk.aws_cloudfront.Distribution(this, 'ImbellaProdDistribution', {
      defaultBehavior: {
          origin: new cdk.aws_cloudfront_origins.S3Origin(prodBucket),
          cachePolicy: cdk.aws_cloudfront.CachePolicy.CACHING_DISABLED,
          viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responsePagePath: '/index.html',
          responseHttpStatus: 200,
        },
        {
          httpStatus: 404,
          responsePagePath: '/index.html',
          responseHttpStatus: 200,
        }
      ],
      certificate: certificate,
      domainNames: ['imbella.kevinr.net'],
      priceClass: cdk.aws_cloudfront.PriceClass.PRICE_CLASS_100,
  });

  const prodTarget = cdk.aws_route53.RecordTarget.fromAlias(new cdk.aws_route53_targets.CloudFrontTarget(prodDistribution));

    new cdk.aws_route53.ARecord(this, 'imbella.kevinr.net', {
        zone: hostedZone,
        target: prodTarget,
        recordName: 'imbella.kevinr.net'
    });
  }
}
