# Development Setup

## Run the backend locally

1. Open repo is visual studio code
1. Navigate to the docker folder and run the following command
    ```bash
    docker compose up
    ```
1. Open repo in a seperate instance of visual studio code 
1. When prompted, or from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`), select:
   ```
   Dev Containers: Reopen in Container
   ```

<!-- ### Node.js and npm
1. Download the latest LTS version of Node.js (which includes npm) from the official website: [https://nodejs.org/](https://nodejs.org/).
1. Run the installer and follow the instructions for your operating system.
1. Verify the installation by running the following commands in your terminal:
    ```bash
   node -v
   npm -v
   ```

### Python
1. Download the latest version of Python from the official website: https://www.python.org/downloads/.
1. During installation, ensure you check the box to "Add Python to PATH."
1. Verify the installation by running the following command in your terminal:
    ```bash
    python --version
    ```

### AWS CDK
1. Install the [AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions).
2. Verify the AWS CLI installation by running:
   ```bash
   aws --version -->

### Docker
1. Download and install Docker Desktop from the official website: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).
2. Follow the installation instructions for your operating system.
3. After installation, ensure Docker is running.
4. Verify the installation by running the following command in your terminal:
   ```bash
   docker --version

### VS Code
1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) if you haven't already.

### LocalStack  
1. [Web Portal](https://app.localstack.cloud/inst/default/status)


<!-- ### Terraform
1. Download the latest version of Terraform from the official website: [https://www.terraform.io/downloads](https://www.terraform.io/downloads).
2. Extract the downloaded archive and move the `terraform` executable to a directory included in your system's PATH (e.g., `C:\Windows\System32` on Windows).
3. Verify the installation by running the following command in your terminal:
   ```bash
   terraform --version

## Local development
1. Naviate to the root foler in the repo and run
    ```bash
    py -m venv .venv
    python -m pip install -U -r requirements.txt
1. Naviate to the docker folder in this repo and run
    ```bash 
    docker-compose up
1. Navigate to the terraform folder in this repo and run
    ```bash 
    docker-compose up
    tflocal init
    tflocal apply
    ```
    type `yes` to apply the changes -->