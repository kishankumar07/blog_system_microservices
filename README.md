-  In Node.js v20.10.0 and later, when you're using ECMAScript modules (ESM), you need to specify the type: "json" attribute when importing JSON files.
- Make sure the type:module inside the package.json

            import swaggerDocument from './swagger.json' assert { type: 'json' };
            
- that was a typical example




# Optional: Deploy to cloud platform (e.g., Render, AWS, etc.)
      - name: Deploy to Render (Example)
        run: |
          curl -X POST https://api.render.com/deploy/some-deploy-url -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"





name: CI/CD Pipeline

on:
  push:
    branches:
      - main 
  pull_request:
    branches:
      - main  

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Post Service Docker Image
        env:
          POST_SERVICE_DB_URL: ${{ secrets.POST_SERVICE_DB_URL }}
        run: |
          docker build \
            --build-arg DB_URL=${POST_SERVICE_DB_URL} \
            -t kta6161/post-service:latest ./post-service
          docker push kta6161/post-service:latest

      - name: Build and Push Comment Service Docker Image
        env:
          COMMENT_SERVICE_DB_URL: ${{ secrets.COMMENT_SERVICE_DB_URL }}
        run: |
          docker build \
            --build-arg DB_URL=${COMMENT_SERVICE_DB_URL} \
            -t kta6161/comment-service:latest ./comment-service
          docker push kta6161/comment-service:latest

      - name: Build and Push API Gateway Docker Image
        run: |
          docker build -t kta6161/api-gateway:latest ./api-gateway
          docker push kta6161/api-gateway:latest

      - name: Clean Up Docker
        run: docker image prune -af

      - name: Deploy Post Service to Render
        run: |
          curl -X POST ${{ secrets.RENDER_POST_SERVICE_HOOK }}

      - name: Deploy Comment Service to Render
        run: |
          curl -X POST ${{ secrets.RENDER_COMMENT_SERVICE_HOOK }}

      - name: Deploy API Gateway to Render
        run: |
          curl -X POST ${{ secrets.RENDER_API_GATEWAY_HOOK }}





