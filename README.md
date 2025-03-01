This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Project Details

### Setup Auth Provider (Google)

Sign in to Google Developer Console with your valid gmail.com account.

Upon sign-in you would be redirected to https://console.cloud.google.com

You would require to create a new project (name it like NextAuth) and after creating the project, click on the left side menu.

Click on `API & Services` option > `OAuth Consent Screen`. Click on 'CREATE' button.

Enter details like App Name (i.e. next-google-auth) etc.

### Get Keys From Provider(Google)

Click on `Credentials` option on left menu, and click on `Create Credentials` menu and `OAuth client ID` menu item.

Select Application type as `Web Application`

Enter url details for `Authorized JavaScript origins` and `Authorized redirect URIs` (For testing purposes http://localhost:3000 should work.)

After saving this details - once again add the following Url under `Authorized redirect URIs` details:
http://localhost:3000/api/auth/callback/:provider (assuming http://localhost:3000 is the domain for this test application).

Note: If the above does not work you can add google as a provider - hard coded as under:
http://localhost:3000/api/auth/callback/google

Hit the CREATE button.

Get the Client Id and Security Key and store it in the `.env file for further use.

### Check the Next Auth JS

Check the `Add authentication in minutes!` section on https://next-auth.js.org/ url for quick overview.

Visit the url: https://next-auth.js.org/getting-started/example for more details on how to implement the authentication flow in Next Js/React App using the next-auth.
