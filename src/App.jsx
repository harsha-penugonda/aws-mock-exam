import React, { useMemo, useState, useEffect } from "react";
import {
    Download,
    Clock,
    PlayCircle,
    RotateCcw,
    ListChecks,
    BookOpenText,
    Filter,
    Upload,
    AlertCircle,
    XCircle,
} from "lucide-react";

/**
 * AWS Cloud Practitioner (CLF-C02) Mock Exam App
 * - Full Exam mode (65 Q, 90 min, weighted by official domains)
 * - Quick Practice (20 Q)
 * - Domain Practice (user picks domain & qty)
 * - Multiple-choice & multiple-response
 * - Explanations + Review
 * - Score breakdown per domain
 * - Export results (CSV)
 * - Import extra questions via JSON (schema documented below)
 *
 * JSON schema for import:
 * [{
 *    id: string,
 *    domain: "Cloud Concepts"|"Security and Compliance"|"Cloud Technology and Services"|"Billing, Pricing, and Support",
 *    type: "single"|"multi",
 *    question: string,
 *    options: [{ id: string, text: string }],
 *    correctOptionIds: string[],
 *    explanation: string,
 *    difficulty?: "easy"|"medium"|"hard"
 * }]
 */

// --- Seed Question Bank (48 Q: 12 per domain). Focused on CLF-C02 task statements. ---
// Note: This seed covers the exam *aspects*; you can import more later.

const SEED_QUESTIONS = [
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

const DOMAINS = [
    { name: "Cloud Concepts", weight: 0.24 },
    { name: "Security and Compliance", weight: 0.3 },
    { name: "Cloud Technology and Services", weight: 0.34 },
    { name: "Billing, Pricing, and Support", weight: 0.12 },
];

const MODE_PRESETS = {
    full: { total: 65, minutes: 90 },
    quick: { total: 20, minutes: 30 },
};

function sampleWeighted(bank, total) {
    // Try to sample per-domain proportional to official weights.
    const byDomain = Object.groupBy(bank, (q) => q.domain);
    const picks = [];
    // First pass proportional allocation
    DOMAINS.forEach((d, idx) => {
        const want = Math.round(total * d.weight);
        const pool = byDomain[d.name] || [];
        const chosen = randomSample(pool, Math.min(pool.length, want));
        picks.push(...chosen);
    });
    // Top up if needed
    while (picks.length < total) {
        const remaining = bank.filter((q) => !picks.includes(q));
        if (remaining.length === 0) break;
        picks.push(remaining[Math.floor(Math.random() * remaining.length)]);
    }
    return shuffle(picks).slice(0, total);
}

function randomSample(arr, n) {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
    }
    return out;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function useCountdown(enabled, minutes) {
    const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
    useEffect(() => setSecondsLeft(minutes * 60), [minutes]);
    useEffect(() => {
        if (!enabled) return;
        const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [enabled]);
    return [secondsLeft, setSecondsLeft];
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export default function App() {
    const [mode, setMode] = useState(null); // 'full' | 'quick' | 'domain' | 'imported'
    const [domainPick, setDomainPick] = useState(DOMAINS[0].name);
    const [domainQty, setDomainQty] = useState(15);
    const [importedQty, setImportedQty] = useState(10);
    const [timerOn, setTimerOn] = useState(false);
    const [started, setStarted] = useState(false);
    const [answers, setAnswers] = useState({}); // id -> Set(optionIds)
    const [imported, setImported] = useState([]);
    const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);

    const bank = useMemo(() => [...SEED_QUESTIONS, ...imported], [imported]);

    const minutes = useMemo(() => {
        if (!mode) return 0;
        if (mode === "domain") return Math.max(10, Math.ceil(domainQty * 1.25));
        if (mode === "imported") return Math.max(10, Math.ceil(importedQty * 1.25));
        return MODE_PRESETS[mode].minutes;
    }, [mode, domainQty, importedQty]);

    const [secondsLeft] = useCountdown(started && timerOn, minutes);

    useEffect(() => {
        if (!started) return;
        if (secondsLeft === 0) {
            setTimerOn(false);
        }
    }, [secondsLeft, started]);

    const visibleQuestions = useMemo(() => {
        if (!started) return [];
        if (mode === "domain") {
            const pool = bank.filter((q) => q.domain === domainPick);
            return shuffle(pool).slice(0, domainQty);
        }
        if (mode === "imported") {
            if (imported.length === 0) return [];
            return shuffle([...imported]).slice(0, Math.min(importedQty, imported.length));
        }
        return sampleWeighted(bank, MODE_PRESETS[mode].total);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, mode, imported, importedQty]);

    const domainStats = useMemo(() => {
        const stats = {};
        for (const d of DOMAINS) stats[d.name] = { total: 0, correct: 0 };
        for (const q of visibleQuestions) {
            stats[q.domain].total += 1;
            const picked = Array.from(answers[q.id] || []);
            const correct = arraysEqual(new Set(picked), new Set(q.correctOptionIds));
            if (correct) stats[q.domain].correct += 1;
        }
        return stats;
    }, [visibleQuestions, answers]);

    const score = useMemo(() => {
        const answered = visibleQuestions.filter((q) => (answers[q.id] || new Set()).size > 0);
        const correct = visibleQuestions.filter((q) =>
            arraysEqual(answers[q.id] || new Set(), new Set(q.correctOptionIds))
        ).length;
        const pct = visibleQuestions.length
            ? Math.round((correct / visibleQuestions.length) * 100)
            : 0;
        return { answered: answered.length, correct, pct };
    }, [visibleQuestions, answers]);

    // Ensure timer starts automatically when exam starts
    // But don't auto-start if all questions are already answered (prevents toggle loop when finished)
    useEffect(() => {
        if (started && !timerOn && secondsLeft > 0) {
            const allAnswered =
                visibleQuestions.length > 0 &&
                visibleQuestions.every((q) => (answers[q.id] || new Set()).size > 0);
            if (!allAnswered) {
                setTimerOn(true);
            }
        }
    }, [started, timerOn, secondsLeft, visibleQuestions, answers]);

    function arraysEqual(a, b) {
        if (a.size !== b.size) return false;
        for (const v of a) if (!b.has(v)) return false;
        return true;
    }

    function toggleAnswer(qid, oid, type) {
        setAnswers((prev) => {
            const set = new Set(prev[qid] || []);
            if (type === "single") {
                return { ...prev, [qid]: new Set([oid]) };
            }
            if (set.has(oid)) set.delete(oid);
            else set.add(oid);
            return { ...prev, [qid]: set };
        });
    }

    function start(modeSel) {
        setMode(modeSel);
        setAnswers({});
        setStarted(true);
        setTimerOn(true);
    }

    function reset() {
        setMode(null);
        setStarted(false);
        setTimerOn(false);
        setAnswers({});
    }

    function exportCSV() {
        const rows = [
            ["id", "domain", "type", "isCorrect", "chosen", "correct", "question"],
            ...visibleQuestions.map((q) => {
                const chosen = Array.from(answers[q.id] || []);
                const isCorrect = arraysEqual(new Set(chosen), new Set(q.correctOptionIds));
                return [
                    q.id,
                    q.domain,
                    q.type,
                    isCorrect ? "1" : "0",
                    chosen.join("|"),
                    q.correctOptionIds.join("|"),
                    q.question.replaceAll("\n", " "),
                ];
            }),
        ];
        const csv = rows
            .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aws-clf-c02-mock-results-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function importJSON(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!Array.isArray(data)) throw new Error("Invalid JSON array");
            // Basic shape validation
            const cleaned = data.filter(
                (q) => q && q.id && q.domain && q.type && q.options && q.correctOptionIds
            );
            setImported((prev) => [...prev, ...cleaned]);
            alert(`Imported ${cleaned.length} questions.`);
        } catch (e) {
            alert(`Import failed: ${e.message}`);
        }
    }

    const finished =
        secondsLeft === 0 ||
        (score.answered === visibleQuestions.length && visibleQuestions.length > 0);

    // Stop timer automatically when exam is finished (all questions answered)
    useEffect(() => {
        if (finished && started && timerOn) {
            setTimerOn(false);
        }
    }, [finished, started, timerOn]);

    const incorrectQuestions = useMemo(() => {
        if (!finished) return [];
        return visibleQuestions.filter((q) => {
            const chosen = Array.from(answers[q.id] || []);
            return !arraysEqual(new Set(chosen), new Set(q.correctOptionIds));
        });
    }, [visibleQuestions, answers, finished]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800 p-6">
            <div className="max-w-5xl mx-auto">
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            AWS Cloud Practitioner Mock Exam
                        </h1>
                        <p className="text-sm text-slate-600">
                            CLF-C02 • Covers all four domains • Multiple-choice & multiple-response
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-2xl border px-3 py-2 bg-white shadow-sm">
                            <Clock className="w-4 h-4" />
                            <span
                                className={`font-mono ${
                                    secondsLeft < 300 && started ? "text-red-600" : ""
                                }`}
                            >
                                {started ? formatTime(secondsLeft) : "--:--"}
                            </span>
                        </div>
                        <button
                            onClick={reset}
                            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-2 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </header>

                {!started && (
                    <div className="rounded-2xl shadow-md p-6 space-y-6 bg-white">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-2xl border bg-white flex flex-col gap-3">
                                <h3 className="font-semibold text-lg">Full Exam</h3>
                                <p className="text-sm text-slate-600">
                                    65 questions • 90 minutes • weighted to the official domain
                                    percentages.
                                </p>
                                <button
                                    onClick={() => start("full")}
                                    className="px-4 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                                >
                                    <PlayCircle className="w-4 h-4" />
                                    Start
                                </button>
                            </div>
                            <div className="p-5 rounded-2xl border bg-white flex flex-col gap-3">
                                <h3 className="font-semibold text-lg">Quick Practice</h3>
                                <p className="text-sm text-slate-600">
                                    20 questions • 30 minutes • mixed domains.
                                </p>
                                <button
                                    onClick={() => start("quick")}
                                    className="px-4 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                                >
                                    <ListChecks className="w-4 h-4" />
                                    Start
                                </button>
                            </div>
                            <div className="p-5 rounded-2xl border bg-white flex flex-col gap-3">
                                <h3 className="font-semibold text-lg">Domain Practice</h3>
                                <div className="space-y-2">
                                    <label className="text-sm block">Domain</label>
                                    <select
                                        className="w-full border rounded-xl p-2 bg-white"
                                        value={domainPick}
                                        onChange={(e) => setDomainPick(e.target.value)}
                                    >
                                        {DOMAINS.map((d) => (
                                            <option key={d.name} value={d.name}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm block">Questions</label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={50}
                                        value={domainQty}
                                        onChange={(e) =>
                                            setDomainQty(parseInt(e.target.value || "0", 10))
                                        }
                                        className="w-full border rounded-xl p-2 bg-white"
                                    />
                                </div>
                                <button
                                    onClick={() => start("domain")}
                                    className="px-4 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                    Start
                                </button>
                            </div>
                        </div>

                        {imported.length > 0 && (
                            <div className="p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Imported Questions</h3>
                                    <span className="text-sm text-blue-700 font-medium">
                                        {imported.length} available
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Practice with your imported JSON questions only.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-sm block">Number of Questions</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={imported.length}
                                        value={importedQty}
                                        onChange={(e) =>
                                            setImportedQty(
                                                Math.min(
                                                    parseInt(e.target.value || "1", 10),
                                                    imported.length
                                                )
                                            )
                                        }
                                        className="w-full border rounded-xl p-2 bg-white"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Max: {imported.length} questions
                                    </p>
                                </div>
                                <button
                                    onClick={() => start("imported")}
                                    className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors font-medium"
                                >
                                    <Upload className="w-4 h-4" />
                                    Start with Imported Questions
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="application/json"
                                    onChange={(e) =>
                                        e.target.files?.[0] && importJSON(e.target.files[0])
                                    }
                                    className="border rounded-xl p-2 bg-white"
                                />
                            </div>
                            <div className="text-sm text-slate-600 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Import questions (JSON)
                                {imported.length > 0 && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        • {imported.length} imported
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border p-4 bg-slate-50">
                            <h4 className="font-semibold mb-2">Domain weights</h4>
                            <div className="grid md:grid-cols-4 gap-3">
                                {DOMAINS.map((d) => (
                                    <div key={d.name} className="p-3 rounded-xl bg-white border">
                                        <div className="text-sm font-medium">{d.name}</div>
                                        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all"
                                                style={{ width: `${d.weight * 100}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1">
                                            {Math.round(d.weight * 100)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">
                            Tip: You can pause the timer by toggling it off in your browser devtools
                            console (advanced), but we recommend practicing under time pressure.
                        </p>
                    </div>
                )}

                {started && (
                    <div className="space-y-4">
                        {visibleQuestions.map((q, idx) => (
                            <div
                                key={q.id}
                                className="rounded-2xl shadow-sm p-5 space-y-3 bg-white"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-slate-600">{q.domain}</div>
                                    <div className="text-xs font-mono px-2 py-1 rounded-full border">
                                        {q.type === "multi"
                                            ? "Multiple response"
                                            : "Multiple choice"}
                                    </div>
                                </div>
                                <div className="text-base font-medium">
                                    {idx + 1}. {q.question}
                                </div>
                                <div className="space-y-2">
                                    {q.type === "single" ? (
                                        <div className="space-y-2">
                                            {q.options.map((o) => {
                                                const checked =
                                                    Array.from(answers[q.id] || [])[0] === o.id;
                                                return (
                                                    <div
                                                        key={o.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <input
                                                            type="radio"
                                                            id={`${q.id}-${o.id}`}
                                                            name={q.id}
                                                            value={o.id}
                                                            checked={checked}
                                                            onChange={() =>
                                                                toggleAnswer(q.id, o.id, "single")
                                                            }
                                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                        />
                                                        <label
                                                            htmlFor={`${q.id}-${o.id}`}
                                                            className="cursor-pointer"
                                                        >
                                                            {o.text}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {q.options.map((o) => {
                                                const checked = (answers[q.id] || new Set()).has(
                                                    o.id
                                                );
                                                return (
                                                    <div
                                                        key={o.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={`${q.id}-${o.id}`}
                                                            checked={checked}
                                                            onChange={() =>
                                                                toggleAnswer(q.id, o.id, "multi")
                                                            }
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <label
                                                            htmlFor={`${q.id}-${o.id}`}
                                                            className="cursor-pointer"
                                                        >
                                                            {o.text}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                            <div className="text-xs text-slate-500">
                                                Select all that apply.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {finished && (
                                    <div className="mt-2 p-3 rounded-xl bg-slate-50 border">
                                        {(() => {
                                            const chosen = Array.from(answers[q.id] || []);
                                            const isCorrect = arraysEqual(
                                                new Set(chosen),
                                                new Set(q.correctOptionIds)
                                            );
                                            return (
                                                <>
                                                    <div
                                                        className={`text-sm font-semibold ${
                                                            isCorrect
                                                                ? "text-green-700"
                                                                : "text-red-700"
                                                        }`}
                                                    >
                                                        {isCorrect ? "Correct" : "Incorrect"}
                                                    </div>
                                                    <div className="text-sm">
                                                        Correct answer
                                                        {q.correctOptionIds.length > 1
                                                            ? "s"
                                                            : ""}:{" "}
                                                        <span className="font-mono">
                                                            {q.correctOptionIds.join(", ")}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-slate-700 leading-relaxed mt-1">
                                                        <BookOpenText className="inline w-4 h-4 mr-1" />{" "}
                                                        {q.explanation}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="sticky bottom-4">
                            <div className="rounded-2xl shadow-lg border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm">
                                        Answered{" "}
                                        <span className="font-semibold">{score.answered}</span> /{" "}
                                        {visibleQuestions.length}
                                    </div>
                                    {finished && (
                                        <>
                                            <div className="text-sm">
                                                Correct{" "}
                                                <span className="font-semibold">
                                                    {score.correct}
                                                </span>
                                            </div>
                                            <div className="text-sm">
                                                Score{" "}
                                                <span className="font-semibold">{score.pct}%</span>
                                            </div>
                                        </>
                                    )}
                                    {!finished && (
                                        <div className="text-sm text-slate-500 italic">
                                            Complete all questions to see your score
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setTimerOn((t) => !t)}
                                        className="px-4 py-2 rounded-2xl border border-gray-300 hover:bg-gray-50 text-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <Clock className="w-4 h-4" />
                                        {timerOn ? "Pause timer" : "Resume timer"}
                                    </button>
                                    <button
                                        onClick={exportCSV}
                                        className="px-4 py-2 rounded-2xl border border-gray-300 hover:bg-gray-50 text-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export results (CSV)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {finished && (
                            <>
                                <div className="rounded-2xl border shadow-md p-6 space-y-4 bg-white">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold">
                                            Review & Domain Breakdown
                                        </h3>
                                        {incorrectQuestions.length > 0 && (
                                            <button
                                                onClick={() =>
                                                    setShowIncorrectOnly(!showIncorrectOnly)
                                                }
                                                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center gap-2 transition-colors"
                                            >
                                                {showIncorrectOnly ? (
                                                    <>
                                                        <XCircle className="w-4 h-4" />
                                                        Show All Questions
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-4 h-4" />
                                                        Review Incorrect (
                                                        {incorrectQuestions.length})
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {Object.entries(domainStats).map(([name, s]) => (
                                            <div
                                                key={name}
                                                className="rounded-xl border p-4 bg-white"
                                            >
                                                <div className="font-medium">{name}</div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${
                                                                s.total
                                                                    ? (s.correct / s.total) * 100
                                                                    : 0
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-sm text-slate-600 mt-1">
                                                    {s.correct} / {s.total} correct
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Passing on the real exam requires a scaled score of
                                        700/1000. This mock uses percentage scoring to give you
                                        directional feedback.
                                    </p>
                                </div>

                                {showIncorrectOnly && incorrectQuestions.length > 0 && (
                                    <div className="rounded-2xl border-2 border-red-200 shadow-md p-6 space-y-4 bg-red-50">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            <h3 className="text-xl font-semibold text-red-900">
                                                Questions to Review ({incorrectQuestions.length})
                                            </h3>
                                        </div>
                                        <p className="text-sm text-red-700">
                                            Review these questions to improve your understanding.
                                        </p>
                                        <div className="space-y-4">
                                            {incorrectQuestions.map((q, idx) => {
                                                const chosen = Array.from(answers[q.id] || []);
                                                return (
                                                    <div
                                                        key={q.id}
                                                        className="rounded-xl border-2 border-red-200 bg-white p-5 space-y-3"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-sm text-slate-600">
                                                                {q.domain}
                                                            </div>
                                                            <div className="text-xs font-mono px-2 py-1 rounded-full border border-red-300 bg-red-50 text-red-700">
                                                                {q.type === "multi"
                                                                    ? "Multiple response"
                                                                    : "Multiple choice"}
                                                            </div>
                                                        </div>
                                                        <div className="text-base font-medium">
                                                            {idx + 1}. {q.question}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="text-sm font-semibold text-red-700">
                                                                Your answer:{" "}
                                                                <span className="font-mono">
                                                                    {chosen.length > 0
                                                                        ? chosen.join(", ")
                                                                        : "Not answered"}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm font-semibold text-green-700">
                                                                Correct answer
                                                                {q.correctOptionIds.length > 1
                                                                    ? "s"
                                                                    : ""}
                                                                :{" "}
                                                                <span className="font-mono">
                                                                    {q.correctOptionIds.join(", ")}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-2 pt-2 border-t">
                                                                {q.options.map((o) => {
                                                                    const isSelected =
                                                                        chosen.includes(o.id);
                                                                    const isCorrect =
                                                                        q.correctOptionIds.includes(
                                                                            o.id
                                                                        );
                                                                    return (
                                                                        <div
                                                                            key={o.id}
                                                                            className={`p-2 rounded-lg border-2 ${
                                                                                isCorrect
                                                                                    ? "border-green-500 bg-green-50"
                                                                                    : isSelected
                                                                                    ? "border-red-500 bg-red-50"
                                                                                    : "border-gray-200 bg-gray-50"
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-mono text-sm">
                                                                                    {o.id}
                                                                                </span>
                                                                                <span
                                                                                    className={`text-sm ${
                                                                                        isCorrect
                                                                                            ? "font-semibold text-green-700"
                                                                                            : isSelected
                                                                                            ? "font-semibold text-red-700"
                                                                                            : "text-slate-600"
                                                                                    }`}
                                                                                >
                                                                                    {o.text}
                                                                                </span>
                                                                                {isCorrect && (
                                                                                    <span className="ml-auto text-xs bg-green-500 text-white px-2 py-1 rounded">
                                                                                        Correct
                                                                                    </span>
                                                                                )}
                                                                                {isSelected &&
                                                                                    !isCorrect && (
                                                                                        <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded">
                                                                                            Your
                                                                                            choice
                                                                                        </span>
                                                                                    )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                                                <div className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-1">
                                                                    <BookOpenText className="w-4 h-4" />
                                                                    Explanation
                                                                </div>
                                                                <div className="text-sm text-blue-800 leading-relaxed">
                                                                    {q.explanation}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
