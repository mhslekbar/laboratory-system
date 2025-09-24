# medepratlab

# TO INSTALL THIS APP ON VPS SERVER 
`

  1 - git clone https://github.com/mhslekbar/laboratory-system.git
  2 - install all dependency
    => in backend
    1 / apt install nodejs
    2 / npm install -g ts-node
    3 / npm i 
    tsc => to convert ts to js
    4 / pm2 start --name lab-sys app.js
    5 / pm2 startup ubuntu
    6 / pm2 status

  <!-- 3 - nano /etc/nginx/sites-available/onmdm -->
  3 - nano /etc/nginx/sites-available/medepratlab
    => ln -s /etc/nginx/sites-available/medepratlab /etc/nginx/sites-enabled/medepratlab
    => 
    server {
      listen 101;
      server_name medepratlab.com www.medepratlab.com;
      location / {
        root /var/www/medepratlab/client;
        index  index.html index.htm;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        try_files $uri $uri/ /index.html;
      }

      listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/medepratlab.com/fullchain.pem; # managed b>    ssl_certificate_key /etc/letsencrypt/live/medepratlab.com/privkey.pem; # managed>    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
  }

  server {
    listen 101;
    server_name api.medepratlab.com;
    location /api {
      proxy_pass http://46.202.132.36:3052;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }

     listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/medepratlab.com/fullchain.pem; # managed b>    ssl_certificate_key /etc/letsencrypt/live/medepratlab.com/privkey.pem; # managed>    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

  }
  
  
  # install ssl
  - apt install certbot python3-certbot-nginx
  - ufw status
  - certbot --nginx -d medepratlab.com -d www.medepratlab.com -d api.medepratlab.com
  <!-- - certbot --nginx -d cdghazaly.com -d www.cdghazaly.com -d api.cdghazaly.com -->
  <!-- - certbot --nginx -d cabinetibtissama.com -d www.cabinetibtissama.com -d api.cabinetibtissama.com -->
  - systemctl status certbot.timer

  <!-- Start to update your project  -->
  - git pull origin master
  <!-- End to update your project  -->

  ##### START to do this for best one
  <!-- mkdir /var/www/medepratlab -->
  <!-- mkdir /var/www/medepratlab/client -->
  <!-- rm -rf /var/www/cdghazaly/* && mkdir /var/www/cdghazaly/client && cp -r build/* /var/www/cdghazaly/client -->
  <!-- rm -rf /var/www/cabinetibtissama/* && mkdir /var/www/cabinetibtissama/client && cp -r build/* /var/www/cabinetibtissama/client -->
  rm -rf /var/www/medepratlab/* && mkdir /var/www/medepratlab/client && cp -r build/* /var/www/medepratlab/client
  
  ##### END to do this for best one
  ```

  ```
  restart the server
    - ps aux | grep node
    - kill -9 <PID>
    - sudo systemctl reload nginx
  ```

`
<!-- run app npx tsx app.ts -->

<!-- "start": "ts-node ./app.ts", -->

<!-- "start": "nodemon ./app.js", -->  this is true

```
  to kill a port
  pm2 delete => "the server name"
  sudo lsof -i :3021
  kill -9 PID
  systemctl restart nginx
```
<!--  -->



<!-- for Typescript app   -->
--- tsc 
  