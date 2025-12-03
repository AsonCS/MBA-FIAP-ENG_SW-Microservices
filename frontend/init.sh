export NODE_ENV=production
export NEXT_PUBLIC_BACKEND_URL=http://localhost
export NEXT_PUBLIC_FEED_URL=http://localhost

rm -R node_modules/
rm -R .next/
npm install
npm start