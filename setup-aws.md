# Setting Up AWS for Capstone Project Deployment

This guide walks you through setting up an AWS EC2 instance for deploying your capstone project.

## Prerequisites

- An AWS account
- Basic familiarity with AWS console
- Your project code pushed to a GitHub repository

## Step 1: Create an EC2 Instance

1. **Log in to the AWS Management Console**
   - Go to https://console.aws.amazon.com/
   - Sign in with your AWS account

2. **Navigate to EC2 Dashboard**
   - Click on "Services" in the top menu
   - Select "EC2" under Compute

3. **Launch a new EC2 instance**
   - Click the "Launch instance" button
   - Enter a name for your instance (e.g., "Capstone-Project")

4. **Select AMI (Amazon Machine Image)**
   - Choose "Ubuntu Server 22.04 LTS (HVM)" as the operating system

5. **Choose Instance Type**
   - Select at least a **t2.medium** (2 vCPU, 4 GB RAM) or larger
   - This is necessary due to the AI model and application requirements
   - For better performance, consider t2.large or t3.large

6. **Configure Key Pair**
   - Create a new key pair or select an existing one
   - If creating new:
     - Enter a key pair name (e.g., "capstone-key")
     - Select RSA and .pem format
     - Download the .pem file and store it securely
   - **IMPORTANT**: You cannot download the key again after this step!

7. **Configure Network Settings**
   - Create a new security group with the following rules:
     - SSH (TCP port 22) - Source: Your IP address or "My IP"
     - HTTP (TCP port 80) - Source: Anywhere (0.0.0.0/0)
     - Custom TCP (port 3000) - Source: Anywhere (0.0.0.0/0)
   - Name the security group (e.g., "capstone-sg")

8. **Configure Storage**
   - Allocate at least 30 GB of storage
   - General Purpose SSD (gp2) is sufficient

9. **Review and Launch**
   - Review your instance configuration
   - Click "Launch instance"

10. **View Instances**
    - Click on "View Instances" to see your new instance being initialized
    - Wait until the "Instance State" shows "Running" and "Status Checks" show "2/2 checks passed"

## Step 2: Connect to Your EC2 Instance

### For macOS/Linux Users:

1. **Open Terminal**

2. **Set Permissions for Your Key File**
   ```bash
   chmod 400 /path/to/your-key.pem
   ```

3. **Connect to Your Instance**
   - Locate the Public IPv4 DNS or Public IPv4 address in your EC2 instance details
   - Use SSH to connect:
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@your-instance-public-ip
   ```

### For Windows Users:

1. **Use PuTTY or Windows Subsystem for Linux (WSL)**
   - If using PuTTY, convert your .pem file to .ppk using PuTTYgen
   - If using WSL, follow the macOS/Linux instructions

## Step 3: Deploy Your Application

1. **Update the GitHub Repository URL**
   - In your EC2 instance, create the deployment script:
   ```bash
   nano deploy.sh
   ```
   - Copy and paste the entire content of the `deploy.sh` script
   - Update the `GITHUB_REPO` variable with your actual GitHub repository URL
   - Press Ctrl+X, then Y, then Enter to save

2. **Make the Script Executable**
   ```bash
   chmod +x deploy.sh
   ```

3. **Run the Deployment Script**
   ```bash
   ./deploy.sh
   ```
   - This will take several minutes to complete
   - The script will automatically update the system, install Docker, clone your repository, and deploy your application

4. **Access Your Application**
   - Once deployment is complete, you can access your application at:
   ```
   http://your-instance-public-ip
   ```

## Step 4: (Optional) Create an Elastic IP

To ensure your instance keeps the same IP address even after stopping and starting:

1. **Navigate to Elastic IPs**
   - In the EC2 Dashboard, click on "Elastic IPs" under "Network & Security"

2. **Allocate New Address**
   - Click "Allocate Elastic IP address"
   - Select "Amazon's pool of IPv4 addresses"
   - Click "Allocate"

3. **Associate Elastic IP**
   - Select the new Elastic IP
   - Click "Actions" then "Associate Elastic IP address"
   - Select your instance
   - Click "Associate"

4. **Update Your Application Configuration**
   - If you've already deployed your application, SSH into your instance again
   - Run the following to update your application with the new IP:
   ```bash
   cd capstone-project
   # Update .env file with new IP if needed
   sudo docker-compose -f docker-compose.prod.yml restart
   ```

## Troubleshooting

### Application Not Accessible

1. **Check Security Group Rules**
   - Verify that ports 80 and 3000 are open in your security group

2. **Check Application Logs**
   ```bash
   cd capstone-project
   sudo docker-compose -f docker-compose.prod.yml logs webapp
   ```

3. **Check Nginx Logs**
   ```bash
   sudo docker-compose -f docker-compose.prod.yml logs nginx
   ```

### Database Connection Issues

1. **Check Database Logs**
   ```bash
   sudo docker-compose -f docker-compose.prod.yml logs db
   ```

2. **Verify .env Configuration**
   ```bash
   cat .env
   ```

## Security Best Practices

1. **Regularly Update Your Instance**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Consider Setting Up HTTPS**
   - For production applications, HTTPS is strongly recommended
   - You can use Let's Encrypt with a domain name

3. **Restrict SSH Access**
   - Update your security group to only allow SSH from your IP address

4. **Set Up Database Backups**
   - Regularly backup your PostgreSQL data volume

## Clean Up

When you're done with your EC2 instance and no longer need it:

1. **Stop or Terminate the Instance**
   - Stopping will allow you to restart it later (charges for EBS still apply)
   - Terminating will permanently delete the instance (no charges)

2. **Release Elastic IP** (if allocated)
   - If you don't release it, you'll be charged for unused Elastic IPs

