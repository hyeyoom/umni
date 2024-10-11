export function GET(request: Request) {
    console.log(request.url)
    return new Response(`Hello from ${process.env.VERCEL_REGION} [${request.url}]`);
}
