---
title: "Using Github actions to deploy Craft CMS websites"
excerpt: "While I regularily use services like Buddy or DeployHQ to build and deploy Craft CMS websites, I wanted to experiment with Github Actions. Here is what I came up with and why."
image: "walk-signal.jpg"
imageAlt: "Walk signal - Photo by Ashim D'Silva"
tags:
  - Craft
  - Github Actions
  - Deployment
---

## Why Github Actions?

Services like [Buddy](https://buddy.works/) or [DeployHQ](https://www.deployhq.com/) are really powerful. They allow you to setup complex build and deployment pipelines like [atomic deployments](https://nystudio107.com/blog/executing-atomic-deployments) using a nice GUI interface.

That being said, that power and ease of use come with a price tag which, in my opinion, can become quite high. Some projects might not even need the provided complexity.

Since I generally use Github to host my repositories, being able to setup a basic deployment pipeline with a single YAML file for free seemed like an alternative worth investigating.

## Deployment steps

My goal was to use [Github Actions](https://docs.github.com/en/free-pro-team@latest/actions) to create a basic build and deployment pipeline for Craft CMS websites. Here are the steps I needed:

1. Pull repository in container
2. Load SSH key (used by rsync)
3. Use specific version of Node
4. Install PHP dependencies with composer
5. Install Node dependencies
6. Build assets using Gulp (or NPM scripts) and Webpack
7. Deploy everything to the production server with rsync
8. Log into the production server and execute Craft commands

## Security

Since this workflow needs to connect to servers using SSH, we have to create three [Github Secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets) in the repository we want to deploy:

- `SSH_HOST`: the IP address of the server we need to connect to
- `SSH_USER`: the SSH use we need to use
- `SSH_KEY`: the SSH key we will use. The recommended option here is to create a dedicated key pair for the repository rather than using your personal key. The public key will be stored on the server, while the private key will be stored in the Github Secret.

We will now be able to reference those secrets in our workflow using the following syntax: `{% raw %}${{ secrets.MYSECRET }}{% endraw %}`

## The end result

After reading a couple of helpful [articles](https://craftcms.com/knowledge-base/deployment-best-practices) and [blogposts](https://blog.fortrabbit.com/how-to-use-github-actions), here is the `craftdeploy.yaml` file I came up with:

```yaml
{%- raw -%}
name: Craft CMS deployments

on:
  push:
    branches: [master]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # Pull repository into the current pipeline
      - name: Pull repository
        uses: actions/checkout@v2

      # Setup container with private SSH Key (used by rsync)
      - name: Load private SSH key
        uses: webfactory/ssh-agent@v0.4.1
        with:
          ssh-private-key: ${{ secrets.SSH_KEY }}

      # Use a specific version of Node
      - name: Setup Node
        uses: actions/setup-node@v1
        with:
          node-version: "12.x"

      # Install PHP dependencies
      - name: Composer install
        run: composer install --no-interaction --no-progress --no-suggest --optimize-autoloader

      # Install NPM dependencies
      - name: NPM install
        run: npm ci

      # Build assets using locally installed Gulp
      - name: Build assets with Gulp
        run: npx gulp build

      # rsync
      # exclude web/uploads is there to avoid deleting user uploaded files
      # Setting StrictHostKeyChecking=no will automatically add new host keys to the user known hosts files.
      - name: Deploy with rsync
        run: |
          rsync -azh --delete-after --exclude={"/web/uploads/","/node_modules/","/.git/","/.github/"} -e "ssh -o StrictHostKeyChecking=no" ./ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:~/

      # execute Craft commands on remote server
      - name: Execute SSH commmands on remote server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            chmod a+x craft
            php craft backup/db
            php craft migrate/all
            php craft project-config/apply
            php craft clear-caches/all
{% endraw %}
```

By creating a `craftdeploy.yaml` file in `./.github/workflows/` and by setting the push event to the `master` branch, we ensure that this workflow will run every time we push code to the master branch of our repository.

Granted, this is a very basic workflow and it can certainly be improved upon. Feel free to [hit me up on Twitter](https://twitter.com/jeromecoupe) if you have ideas.

I have been testing it with a couple of Craft projects for a couple of months and have not experienced any issue so far. The workflow is consistenty taking between 1 and 3 minutes to run, which I find rather reasonable.

While I will probably continue using Buddy and the likes for more complex needs, I am also quite happy with the convenient, cheap and reliable option Github Actions provides.
