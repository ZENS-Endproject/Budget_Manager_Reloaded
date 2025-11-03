# Overview

## About us
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

# 2025-11-03 ReCap BMR   
  
**Done**  
  
1. Renamed “main” to “_main” im Senda’s copy of the apply - action file to avoid that workflow starts every time something is committed to the main branch.   
2. Introduce “workflow_dispatch” for the “apply” workflow so that one can choose the branch (that will be used for the workflow) when starting the workflow manually.   
3. Have one individual Terraform state file for each single branch in the S3 bucket. This allows to run TF separately and simultaneously.   
4. Introduce the branch name as prefix for the different resources names in the “main.tf”.   
5. Background: Steps 2. - 4. are supposed to allow parallel development:  Each developer can run independent the apply and destroy workflows paralelly in its respective branch. This will enable parallel development, deployment to AWS and testing of independent features. Once the respective feature is done and tested in the individual branch, it can be merged to the main branch.    
6. Fixed the issue that the frontend / nginx was not responding when called via browser on public ip. To fix this the port mapping for the frontend in the docker-compose file needed to be changed to “80:80”.   
  
**Open points**  
  
1. Fix the “initiate data base” step of the apply workflow.  Currently the psql complains about wrong characters in the hostname.   
2. Currently the logon page of the apps can be called in the browser but after entering the user name and password, a “server error” is displayed. Probably needs to fix the network connection between frontend and backend.    
3. Sooner or later the repo needs to be made public because the 2000 minutes monthly  allowed for private repos wont be sufficient.    


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
