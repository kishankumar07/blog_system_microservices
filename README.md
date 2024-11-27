-  In Node.js v20.10.0 and later, when you're using ECMAScript modules (ESM), you need to specify the type: "json" attribute when importing JSON files.
- Make sure the type:module inside the package.json

            import swaggerDocument from './swagger.json' assert { type: 'json' };
            
- that was a typical example




# Optional: Deploy to cloud platform (e.g., Render, AWS, etc.)
      - name: Deploy to Render (Example)
        run: |
          curl -X POST https://api.render.com/deploy/some-deploy-url -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"










