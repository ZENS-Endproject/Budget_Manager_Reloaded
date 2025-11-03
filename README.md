# Overview

## About nassi
- Entstanden aus einem 1-jährigen IT training
- Mehrere Contributors
- Tools used: GitHub, Git Actions, REACT, Tailwind, docker, terraform, Postgres

## First-Time Setup
Create the following credentions in Settings => Secrets and variables => Actions:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY 
- AWS_EC2_KEY_PEM (relates to the name of the EC2 key pair in `terraform.tfvars`)
- AWS_POSTGRES_PASSWORD -> (to be implemented!)

## ToDo (backlog)
1. The SQL script for initial Postgres setup should check
   if the `budget` database already exists and then exit. 
2. Remove ALL hard coded credentials (like Postgres password)
3. Switch from HTTP to HTTPS
4. 

## Tips & Tricks

# Deep-Dives

## GitHub
Best Practice: Always include package.json (and package-lock.json) in your GitHub repo
 Why: package.json defines your application’s identity, dependencies, and scripts

It’s essential for reproducibility — others (and CI/CD) can just run:

```
npm install
```

to rebuild the exact environment

It allows automatic rebuilds in Docker, GitHub Actions, AWS, etc.

## Terraform

### Directory structure

The directory 'budget-infra/' contains the infrastructure code:

```
budget-infra/
│
├── main.tf          # main entrypoint (providers, EC2 definition, etc.)
├── ebs.tf           # your EBS logic (volume + attachment)
├── variables.tf     # variable definitions
├── backend.tf       # S3 bucket for terraform state
├── user_data.sh     # optional: EC2 boot script
└── terraform.tfvars # optional: variable values
```

Terraform automatically loads all `.tf` files in the same directory — you **don’t need to import or include them manually**.
It merges them together into a single plan internally.

---

1. `main.tf`: This defines your AWS provider and an EC2 instance to attach the volume to:
2. `variables.tf`
3. `ebs.tf`: Contains the EBS creation and attachment logic.Terraform automatically recognizes and uses the variables defined in `variables.tf` and the EC2 instance defined in `main.tf`.
4. `backend.tf`: Refers to an S3 bucket to hold the `terraform.tfstate`. This allows to split in the github workflow into a terraform `apply` and a `destroy` workflow. 
    Without this the `destroy` workflow would not "know" the state and fail. 
5. `terraform.tfvars`: To pass in variables (instead of hardcoding defaults)

### Initialize and apply:

First time a S3 state bucket needs to be created with

```
aws s3api create-bucket   --bucket tf-bud-relo-state-bucket   --region eu-central-1   --create-bucket-configuration LocationConstraint=eu-central-1
```

From inside your Terraform directory:

```bash
terraform init
terraform plan
terraform apply
```

Terraform will:

1. Create the EC2 instance.
2. Find or create the EBS volume.
3. Attach it to the EC2 instance.
4. Inject and run your `user_data.sh` to mount `/mnt/pgdata`.
