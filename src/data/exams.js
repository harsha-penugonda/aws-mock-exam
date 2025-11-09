/**
 * Question bank and exam configuration data for the AWS mock exam.
 */

export const SEED_QUESTIONS = [
    // Domain 1: Cloud Concepts (24%)
    {
        id: "D1-Q1",
        domain: "Cloud Concepts",
        type: "single",
        question:
            "Which benefit of the AWS Cloud MOST directly relates to replacing upfront capital expense with pay-as-you-go?",
        options: [
            { id: "a", text: "Global reach" },
            { id: "b", text: "Economies of scale" },
            { id: "c", text: "Variable expense instead of capital expense" },
            { id: "d", text: "High availability" },
        ],
        correctOptionIds: ["c"],
        explanation:
            "Cloud economics emphasize shifting from CapEx to OpEx with pay-as-you-go pricing.",
        difficulty: "easy",
    },
    {
        id: "D1-Q2",
        domain: "Cloud Concepts",
        type: "single",
        question:
            "Which pillar of the AWS Well-Architected Framework focuses on using resources efficiently to meet system requirements?",
        options: [
            { id: "a", text: "Security" },
            { id: "b", text: "Performance efficiency" },
            { id: "c", text: "Operational excellence" },
            { id: "d", text: "Reliability" },
        ],
        correctOptionIds: ["b"],
        explanation:
            "Performance efficiency is about selecting resource types and sizes, and monitoring to maintain efficiency.",
    },
    {
        id: "D1-Q3",
        domain: "Cloud Concepts",
        type: "single",
        question:
            "A company wants to migrate quickly with minimal changes to the application code. Which migration strategy is MOST appropriate?",
        options: [
            { id: "a", text: "Re-architect" },
            { id: "b", text: "Re-host (lift and shift)" },
            { id: "c", text: "Retire" },
            { id: "d", text: "Re-purchase" },
        ],
        correctOptionIds: ["b"],
        explanation: "Re-host (lift and shift) moves applications with minimal changes.",
    },
    {
        id: "D1-Q4",
        domain: "Cloud Concepts",
        type: "single",
        question:
            "Which AWS resource helps organizations align business and technology during cloud adoption by providing perspectives such as Business, People, and Governance?",
        options: [
            { id: "a", text: "AWS Well-Architected Tool" },
            { id: "b", text: "AWS Cloud Adoption Framework (AWS CAF)" },
            { id: "c", text: "AWS Organizations" },
            { id: "d", text: "AWS Trusted Advisor" },
        ],
        correctOptionIds: ["b"],
        explanation: "AWS CAF guides cloud adoption across multiple perspectives.",
    },
    {
        id: "D1-Q5",
        domain: "Cloud Concepts",
        type: "single",
        question: "Which statement BEST describes elasticity in the AWS Cloud?",
        options: [
            { id: "a", text: "The ability to run infrastructure across multiple providers" },
            { id: "b", text: "Automatically adding/removing resources to match demand" },
            { id: "c", text: "Deploying applications globally with low latency" },
            { id: "d", text: "Encrypting data at rest and in transit" },
        ],
        correctOptionIds: ["b"],
        explanation: "Elasticity scales resources up or down automatically with demand.",
    },
    {
        id: "D1-Q6",
        domain: "Cloud Concepts",
        type: "single",
        question: "Which is a benefit of the AWS global infrastructure?",
        options: [
            { id: "a", text: "Single data center hosting for all Regions" },
            {
                id: "b",
                text: "Global low-latency access using multiple Regions and edge locations",
            },
            { id: "c", text: "Guaranteed on-premises connectivity" },
            { id: "d", text: "Automatic code refactoring" },
        ],
        correctOptionIds: ["b"],
        explanation: "AWS Regions, AZs, and edge locations enable low latency and resiliency.",
    },
    {
        id: "D1-Q7",
        domain: "Cloud Concepts",
        type: "single",
        question: "Which option BEST describes rightsizing in cloud economics?",
        options: [
            { id: "a", text: "Buying the largest instances to avoid constraints" },
            { id: "b", text: "Matching instance types/sizes to actual load patterns" },
            { id: "c", text: "Using Reserved Instances for 1-year terms only" },
            { id: "d", text: "Eliminating monitoring to save costs" },
        ],
        correctOptionIds: ["b"],
        explanation: "Rightsizing aligns capacity to needs to optimize cost and performance.",
    },
    {
        id: "D1-Q8",
        domain: "Cloud Concepts",
        type: "single",
        question:
            "Which practice supports sustainability in the cloud per the Well-Architected Framework?",
        options: [
            { id: "a", text: "Provision for peak at all times" },
            { id: "b", text: "Choose efficient instance families and scale dynamically" },
            { id: "c", text: "Run workloads in a single AZ" },
            { id: "d", text: "Disable auto scaling" },
        ],
        correctOptionIds: ["b"],
        explanation: "Use efficient resources and dynamic scaling to reduce waste.",
    },
    {
        id: "D1-Q9",
        domain: "Cloud Concepts",
        type: "multi",
        question: "Which are common benefits of migrating to AWS? (Select TWO)",
        options: [
            { id: "a", text: "Improved agility and time to market" },
            { id: "b", text: "Guaranteed lower total cost for all workloads" },
            { id: "c", text: "Access to managed services" },
            { id: "d", text: "No need for governance" },
            { id: "e", text: "Elimination of all security responsibilities" },
        ],
        correctOptionIds: ["a", "c"],
        explanation:
            "Agility and managed services are key; cost depends on design; governance and some security remain customer responsibilities.",
    },
    {
        id: "D1-Q10",
        domain: "Cloud Concepts",
        type: "single",
        question: "Which tool helps evaluate workloads against best practices in the five pillars?",
        options: [
            { id: "a", text: "AWS Trusted Advisor" },
            { id: "b", text: "AWS Well-Architected Tool" },
            { id: "c", text: "AWS Config" },
            { id: "d", text: "AWS Budgets" },
        ],
        correctOptionIds: ["b"],
        explanation: "Well-Architected Tool is used to review workloads against the W-A Framework.",
    },
    {
        id: "D1-Q11",
        domain: "Cloud Concepts",
        type: "single",
        question: "Which statement BEST describes availability zones (AZs)?",
        options: [
            { id: "a", text: "Multiple Regions within a country" },
            { id: "b", text: "Physically separate data centers within a Region" },
            { id: "c", text: "Customer on-premises facilities" },
            { id: "d", text: "Edge network locations for caching" },
        ],
        correctOptionIds: ["b"],
        explanation: "AZs are isolated DCs in a Region for high availability.",
    },
    {
        id: "D1-Q12",
        domain: "Cloud Concepts",
        type: "single",
        question: "Which pricing model offers significant discounts for 1- or 3-year commitments?",
        options: [
            { id: "a", text: "On-Demand" },
            { id: "b", text: "Savings Plans/Reserved Instances" },
            { id: "c", text: "Spot Instances only" },
            { id: "d", text: "Free Tier" },
        ],
        correctOptionIds: ["b"],
        explanation: "Savings Plans/RIs trade commitment for lower rates.",
    },

    // Domain 2: Security & Compliance (30%)
    {
        id: "D2-Q1",
        domain: "Security and Compliance",
        type: "single",
        question:
            "In the shared responsibility model for Amazon EC2, which is the CUSTOMER responsible for?",
        options: [
            { id: "a", text: "Physical security of data centers" },
            { id: "b", text: "Patching the underlying hypervisor" },
            { id: "c", text: "Configuring security groups and OS patches on instances" },
            { id: "d", text: "Availability of the power and cooling" },
        ],
        correctOptionIds: ["c"],
        explanation:
            "Customers manage guest OS, application software, and instance-level configuration.",
    },
    {
        id: "D2-Q2",
        domain: "Security and Compliance",
        type: "single",
        question: "Which AWS service provides temporary security credentials?",
        options: [
            { id: "a", text: "AWS STS" },
            { id: "b", text: "AWS KMS" },
            { id: "c", text: "Amazon GuardDuty" },
            { id: "d", text: "AWS CloudTrail" },
        ],
        correctOptionIds: ["a"],
        explanation: "AWS Security Token Service issues temporary, limited-privilege credentials.",
    },
    {
        id: "D2-Q3",
        domain: "Security and Compliance",
        type: "single",
        question: "Which service provides central access management to multiple AWS accounts?",
        options: [
            { id: "a", text: "AWS Identity and Access Management (IAM)" },
            { id: "b", text: "AWS Organizations" },
            { id: "c", text: "AWS IAM Identity Center (AWS SSO)" },
            { id: "d", text: "Amazon Cognito" },
        ],
        correctOptionIds: ["b"],
        explanation:
            "AWS Organizations manages multi-account structure, policies, and consolidated billing.",
    },
    {
        id: "D2-Q4",
        domain: "Security and Compliance",
        type: "single",
        question:
            "Which AWS service helps you view and download compliance reports such as SOC or ISO?",
        options: [
            { id: "a", text: "AWS Artifact" },
            { id: "b", text: "AWS Security Hub" },
            { id: "c", text: "AWS Shield" },
            { id: "d", text: "AWS Detective" },
        ],
        correctOptionIds: ["a"],
        explanation: "AWS Artifact is the portal for compliance reports and agreements.",
    },
    {
        id: "D2-Q5",
        domain: "Security and Compliance",
        type: "multi",
        question: "Which TWO services are primarily for threat detection/monitoring? (Select TWO)",
        options: [
            { id: "a", text: "Amazon GuardDuty" },
            { id: "b", text: "AWS Shield Advanced" },
            { id: "c", text: "AWS CloudTrail" },
            { id: "d", text: "AWS WAF" },
            { id: "e", text: "AWS KMS" },
        ],
        correctOptionIds: ["a", "c"],
        explanation:
            "GuardDuty provides intelligent threat detection; CloudTrail records API activity for audit/monitoring.",
    },
    {
        id: "D2-Q6",
        domain: "Security and Compliance",
        type: "single",
        question: "Which is the BEST practice for least privilege access?",
        options: [
            { id: "a", text: "Attach AdministratorAccess to everyone" },
            { id: "b", text: "Use inline policies on users" },
            { id: "c", text: "Grant only the permissions required, preferably to roles or groups" },
            { id: "d", text: "Share root credentials with trusted admins" },
        ],
        correctOptionIds: ["c"],
        explanation: "Use roles/groups with least privilege; never use root for daily tasks.",
    },
    {
        id: "D2-Q7",
        domain: "Security and Compliance",
        type: "single",
        question: "What does AWS KMS primarily provide?",
        options: [
            { id: "a", text: "Network firewalling" },
            { id: "b", text: "Key management and encryption" },
            { id: "c", text: "DDoS protection" },
            { id: "d", text: "Vulnerability scanning" },
        ],
        correctOptionIds: ["b"],
        explanation: "KMS manages cryptographic keys for encryption/decryption.",
    },
    {
        id: "D2-Q8",
        domain: "Security and Compliance",
        type: "single",
        question:
            "Which service aggregates and prioritizes security findings from multiple sources?",
        options: [
            { id: "a", text: "AWS Security Hub" },
            { id: "b", text: "Amazon Inspector" },
            { id: "c", text: "AWS Shield" },
            { id: "d", text: "Amazon Macie" },
        ],
        correctOptionIds: ["a"],
        explanation:
            "Security Hub centralizes findings from services such as GuardDuty, Inspector, Macie, and partners.",
    },
    {
        id: "D2-Q9",
        domain: "Security and Compliance",
        type: "single",
        question: "Which service discovers sensitive data in S3 such as PII?",
        options: [
            { id: "a", text: "Amazon Macie" },
            { id: "b", text: "Amazon Inspector" },
            { id: "c", text: "AWS Shield" },
            { id: "d", text: "AWS Config" },
        ],
        correctOptionIds: ["a"],
        explanation: "Macie uses ML to discover and protect sensitive data in S3.",
    },
    {
        id: "D2-Q10",
        domain: "Security and Compliance",
        type: "single",
        question: "Where can you find a record of API calls to your AWS account?",
        options: [
            { id: "a", text: "AWS CloudTrail" },
            { id: "b", text: "Amazon CloudWatch Logs only" },
            { id: "c", text: "AWS Trusted Advisor" },
            { id: "d", text: "AWS Service Catalog" },
        ],
        correctOptionIds: ["a"],
        explanation: "CloudTrail logs account activity and API calls.",
    },
    {
        id: "D2-Q11",
        domain: "Security and Compliance",
        type: "single",
        question:
            "Which service provides managed DDoS protection at the edge for CloudFront and Route 53?",
        options: [
            { id: "a", text: "AWS Shield" },
            { id: "b", text: "AWS WAF" },
            { id: "c", text: "AWS Firewall Manager" },
            { id: "d", text: "Amazon Inspector" },
        ],
        correctOptionIds: ["a"],
        explanation: "AWS Shield (Standard/Advanced) provides DDoS protection.",
    },
    {
        id: "D2-Q12",
        domain: "Security and Compliance",
        type: "multi",
        question: "Which are customer responsibilities for RDS? (Select TWO)",
        options: [
            { id: "a", text: "Database parameter configuration" },
            { id: "b", text: "Patching the RDS host OS" },
            { id: "c", text: "Managing database users and permissions" },
            { id: "d", text: "Replacing failed storage drives" },
            { id: "e", text: "Physical security of DCs" },
        ],
        correctOptionIds: ["a", "c"],
        explanation:
            "With managed services like RDS, AWS handles infrastructure/OS; the customer manages data, schema, and DB users.",
    },

    // Domain 3: Cloud Technology & Services (34%)
    {
        id: "D3-Q1",
        domain: "Cloud Technology and Services",
        type: "single",
        question: "Which service provides object storage with 11 9's of durability?",
        options: [
            { id: "a", text: "Amazon EFS" },
            { id: "b", text: "Amazon S3" },
            { id: "c", text: "Amazon EBS" },
            { id: "d", text: "AWS Backup" },
        ],
        correctOptionIds: ["b"],
        explanation: "Amazon S3 offers high durability object storage.",
    },
    {
        id: "D3-Q2",
        domain: "Cloud Technology and Services",
        type: "single",
        question: "Which compute option lets you run containers without managing servers?",
        options: [
            { id: "a", text: "Amazon EC2" },
            { id: "b", text: "Amazon ECS on EC2" },
            { id: "c", text: "AWS Fargate" },
            { id: "d", text: "Amazon EKS on self-managed nodes" },
        ],
        correctOptionIds: ["c"],
        explanation: "Fargate is serverless compute for containers.",
    },
    {
        id: "D3-Q3",
        domain: "Cloud Technology and Services",
        type: "single",
        question:
            "A team needs a relational database with managed backups and patching. Which service?",
        options: [
            { id: "a", text: "Amazon DynamoDB" },
            { id: "b", text: "Amazon RDS" },
            { id: "c", text: "Amazon Redshift" },
            { id: "d", text: "Amazon Neptune" },
        ],
        correctOptionIds: ["b"],
        explanation: "RDS is a managed relational database service.",
    },
    {
        id: "D3-Q4",
        domain: "Cloud Technology and Services",
        type: "single",
        question: "Which service is best for content delivery to users globally?",
        options: [
            { id: "a", text: "Amazon CloudFront" },
            { id: "b", text: "AWS Direct Connect" },
            { id: "c", text: "Amazon Route 53" },
            { id: "d", text: "AWS Global Accelerator" },
        ],
        correctOptionIds: ["a"],
        explanation: "CloudFront is AWS's CDN for caching and delivery.",
    },
    {
        id: "D3-Q5",
        domain: "Cloud Technology and Services",
        type: "single",
        question:
            "Which service provides serverless functions that run code in response to events?",
        options: [
            { id: "a", text: "AWS Lambda" },
            { id: "b", text: "Amazon EC2 Auto Scaling" },
            { id: "c", text: "Amazon Lightsail" },
            { id: "d", text: "Amazon EMR" },
        ],
        correctOptionIds: ["a"],
        explanation: "Lambda runs code without provisioning servers.",
    },
    {
        id: "D3-Q6",
        domain: "Cloud Technology and Services",
        type: "single",
        question:
            "Which AWS network service provides a managed authoritative DNS with routing policies?",
        options: [
            { id: "a", text: "Amazon Route 53" },
            { id: "b", text: "AWS Direct Connect" },
            { id: "c", text: "AWS Transit Gateway" },
            { id: "d", text: "Amazon VPC" },
        ],
        correctOptionIds: ["a"],
        explanation: "Route 53 provides DNS and features like latency-based routing.",
    },
    {
        id: "D3-Q7",
        domain: "Cloud Technology and Services",
        type: "single",
        question:
            "Which service is a NoSQL key-value and document database offering single-digit millisecond latency?",
        options: [
            { id: "a", text: "Amazon RDS" },
            { id: "b", text: "Amazon DynamoDB" },
            { id: "c", text: "Amazon Aurora" },
            { id: "d", text: "Amazon OpenSearch Service" },
        ],
        correctOptionIds: ["b"],
        explanation: "DynamoDB is AWS's managed NoSQL key-value/document DB.",
    },
    {
        id: "D3-Q8",
        domain: "Cloud Technology and Services",
        type: "single",
        question: "Which service provides centralized logging, metrics, and alarms?",
        options: [
            { id: "a", text: "Amazon CloudWatch" },
            { id: "b", text: "AWS CloudTrail" },
            { id: "c", text: "AWS Config" },
            { id: "d", text: "AWS X-Ray" },
        ],
        correctOptionIds: ["a"],
        explanation: "CloudWatch collects metrics/logs and can trigger alarms.",
    },
    {
        id: "D3-Q9",
        domain: "Cloud Technology and Services",
        type: "single",
        question:
            "A startup needs simple, low-cost VMs with a managed stack for small apps. Which service?",
        options: [
            { id: "a", text: "Amazon Lightsail" },
            { id: "b", text: "Amazon EC2" },
            { id: "c", text: "AWS Batch" },
            { id: "d", text: "AWS Elastic Beanstalk" },
        ],
        correctOptionIds: ["a"],
        explanation: "Lightsail bundles compute, storage, and networking for simple deployments.",
    },
    {
        id: "D3-Q10",
        domain: "Cloud Technology and Services",
        type: "multi",
        question:
            "Which TWO services help decouple and connect distributed components? (Select TWO)",
        options: [
            { id: "a", text: "Amazon SQS" },
            { id: "b", text: "Amazon SNS" },
            { id: "c", text: "AWS CodePipeline" },
            { id: "d", text: "AWS Direct Connect" },
            { id: "e", text: "AWS Cloud9" },
        ],
        correctOptionIds: ["a", "b"],
        explanation: "SQS (queues) and SNS (pub/sub) are messaging services for decoupling.",
    },
    {
        id: "D3-Q11",
        domain: "Cloud Technology and Services",
        type: "single",
        question:
            "Which storage service provides a fully managed, scalable NFS file system for Linux workloads?",
        options: [
            { id: "a", text: "Amazon EFS" },
            { id: "b", text: "Amazon EBS" },
            { id: "c", text: "Amazon S3" },
            { id: "d", text: "AWS Backup" },
        ],
        correctOptionIds: ["a"],
        explanation: "EFS is managed NFS file storage for EC2 and on-prem via Direct Connect/VPN.",
    },
    {
        id: "D3-Q12",
        domain: "Cloud Technology and Services",
        type: "single",
        question:
            "Which service simplifies deploying and scaling web apps without managing the infrastructure?",
        options: [
            { id: "a", text: "AWS Elastic Beanstalk" },
            { id: "b", text: "AWS CodeDeploy" },
            { id: "c", text: "AWS OpsWorks" },
            { id: "d", text: "AWS Proton" },
        ],
        correctOptionIds: ["a"],
        explanation:
            "Elastic Beanstalk handles provisioning, scaling, and monitoring for supported platforms.",
    },

    // Domain 4: Billing, Pricing & Support (12%)
    {
        id: "D4-Q1",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question: "Which tool lets you set custom cost thresholds and receive alerts?",
        options: [
            { id: "a", text: "AWS Budgets" },
            { id: "b", text: "Cost Explorer" },
            { id: "c", text: "AWS Pricing Calculator" },
            { id: "d", text: "AWS Trusted Advisor" },
        ],
        correctOptionIds: ["a"],
        explanation: "AWS Budgets sends alerts when forecasted/actual costs exceed thresholds.",
    },
    {
        id: "D4-Q2",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question: "Which offers consolidated billing and volume discounts across accounts?",
        options: [
            { id: "a", text: "AWS Organizations" },
            { id: "b", text: "AWS Marketplace" },
            { id: "c", text: "AWS Service Catalog" },
            { id: "d", text: "AWS License Manager" },
        ],
        correctOptionIds: ["a"],
        explanation: "Organizations enables consolidated billing and pooled discounts.",
    },
    {
        id: "D4-Q3",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question: "Which AWS Support plan provides access to TAM and Concierge?",
        options: [
            { id: "a", text: "Developer" },
            { id: "b", text: "Business" },
            { id: "c", text: "Enterprise On-Ramp" },
            { id: "d", text: "Enterprise" },
        ],
        correctOptionIds: ["d"],
        explanation:
            "Enterprise includes a Technical Account Manager and the Concierge team; On-Ramp offers guidance but not full TAM.",
    },
    {
        id: "D4-Q4",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question:
            "Which tool provides interactive charts to analyze historical AWS spend and usage?",
        options: [
            { id: "a", text: "AWS Budgets" },
            { id: "b", text: "AWS Cost Explorer" },
            { id: "c", text: "AWS Pricing Calculator" },
            { id: "d", text: "AWS Compute Optimizer" },
        ],
        correctOptionIds: ["b"],
        explanation: "Cost Explorer visualizes and analyzes cost and usage data.",
    },
    {
        id: "D4-Q5",
        domain: "Billing, Pricing, and Support",
        type: "multi",
        question: "Which TWO can reduce compute costs for steady-state workloads? (Select TWO)",
        options: [
            { id: "a", text: "Savings Plans" },
            { id: "b", text: "Spot Instances for all prod workloads" },
            { id: "c", text: "Rightsizing instances" },
            { id: "d", text: "Disabling Auto Scaling" },
            { id: "e", text: "Moving all data to S3 Glacier Instant Retrieval" },
        ],
        correctOptionIds: ["a", "c"],
        explanation: "Savings Plans and rightsizing help control steady-state compute costs.",
    },
    {
        id: "D4-Q6",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question: "Which is the BEST tool to estimate monthly costs before deployment?",
        options: [
            { id: "a", text: "AWS Pricing Calculator" },
            { id: "b", text: "AWS Budgets" },
            { id: "c", text: "Cost Explorer" },
            { id: "d", text: "Trusted Advisor" },
        ],
        correctOptionIds: ["a"],
        explanation: "Pricing Calculator estimates costs pre-deployment.",
    },
    {
        id: "D4-Q7",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question: "Which Trusted Advisor category helps you find cost-saving opportunities?",
        options: [
            { id: "a", text: "Service Limits" },
            { id: "b", text: "Cost Optimization" },
            { id: "c", text: "Performance" },
            { id: "d", text: "Fault Tolerance" },
        ],
        correctOptionIds: ["b"],
        explanation: "Trusted Advisor includes Cost Optimization checks.",
    },
    {
        id: "D4-Q8",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question:
            "Which pricing approach offers the BIGGEST discount in exchange for flexibility across instance families?",
        options: [
            { id: "a", text: "Standard Reserved Instances" },
            { id: "b", text: "Compute Savings Plans" },
            { id: "c", text: "Convertible Reserved Instances" },
            { id: "d", text: "Spot Instances only" },
        ],
        correctOptionIds: ["b"],
        explanation:
            "Compute Savings Plans provide flexible discounted rates across families, regions, and OS, typically with strong discounts.",
    },
    {
        id: "D4-Q9",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question: "What is the primary purpose of a cost allocation tag?",
        options: [
            { id: "a", text: "Encrypt S3 objects" },
            { id: "b", text: "Identify resources for cost tracking and chargeback" },
            { id: "c", text: "Throttle API calls" },
            { id: "d", text: "Enable auto scaling" },
        ],
        correctOptionIds: ["b"],
        explanation: "Cost allocation tags map resource spend to owners or projects.",
    },
    {
        id: "D4-Q10",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question:
            "Which support plan is MOST appropriate for non-production experimentation with general guidance during business hours?",
        options: [
            { id: "a", text: "Developer" },
            { id: "b", text: "Business" },
            { id: "c", text: "Enterprise On-Ramp" },
            { id: "d", text: "Enterprise" },
        ],
        correctOptionIds: ["a"],
        explanation: "Developer plan provides business-hours support and general guidance.",
    },
    {
        id: "D4-Q11",
        domain: "Billing, Pricing, and Support",
        type: "multi",
        question: "Which TWO features help track and control multi-account spend? (Select TWO)",
        options: [
            { id: "a", text: "Consolidated billing" },
            { id: "b", text: "AWS IAM access keys" },
            { id: "c", text: "AWS Budgets with alerts" },
            { id: "d", text: "AWS CodeCommit" },
            { id: "e", text: "AWS Snowball" },
        ],
        correctOptionIds: ["a", "c"],
        explanation: "Consolidated billing and Budgets are key for multi-account cost control.",
    },
    {
        id: "D4-Q12",
        domain: "Billing, Pricing, and Support",
        type: "single",
        question:
            "Which pricing model is MOST appropriate for fault-tolerant, interruptible workloads?",
        options: [
            { id: "a", text: "On-Demand Instances" },
            { id: "b", text: "Spot Instances" },
            { id: "c", text: "Dedicated Hosts" },
            { id: "d", text: "Savings Plans" },
        ],
        correctOptionIds: ["b"],
        explanation: "Spot Instances offer deep discounts for interruptible workloads.",
    },
];

export const DOMAINS = [
    { name: "Cloud Concepts", weight: 0.24 },
    { name: "Security and Compliance", weight: 0.3 },
    { name: "Cloud Technology and Services", weight: 0.34 },
    { name: "Billing, Pricing, and Support", weight: 0.12 },
];

export const MODE_PRESETS = {
    full: { total: 65, minutes: 90 },
    quick: { total: 20, minutes: 30 },
};
