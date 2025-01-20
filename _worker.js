let token = "";
export default {
	async fetch(request ,env) {
		const url = new URL(request.url);
		if(url.pathname !== '/'){
			let githubRawUrl = 'https://raw.githubusercontent.com';
			if (new RegExp(githubRawUrl, 'i').test(url.pathname)){
				githubRawUrl += url.pathname.split(githubRawUrl)[1];
			} else {
				if (env.GH_NAME) {
					githubRawUrl += '/' + env.GH_NAME;
					if (env.GH_REPO) {
						githubRawUrl += '/' + env.GH_REPO;
						if (env.GH_BRANCH) githubRawUrl += '/' + env.GH_BRANCH;
					}
				}
				githubRawUrl += url.pathname;
			}
			//console.log(githubRawUrl);
			if (env.GH_TOKEN && env.TOKEN){
				if (env.TOKEN == url.searchParams.get('token')) token = env.GH_TOKEN || token;
				else token = url.searchParams.get('token') || token;
			} else token = url.searchParams.get('token') || env.GH_TOKEN || env.TOKEN || token;
			
			const githubToken = token;
			//console.log(githubToken);
			if (!githubToken || githubToken == '') return new Response('TOKEN不能为空', { status: 400 });
			
			// 构建请求头
			const headers = new Headers();
			headers.append('Authorization', `token ${githubToken}`);

			// 发起请求
			const response = await fetch(githubRawUrl, { headers });

			// 检查请求是否成功 (状态码 200 到 299)
			if (response.ok) {
				const contentType = response.headers.get('Content-Type') || 'text/plain';
				const headers = new Headers(response.headers);
				headers.set('Content-Disposition', 'inline');
				headers.set('Content-Type', contentType);
				
				return new Response(response.body, {
					status: response.status,
					headers: response.headers
				});
			} else {
				const errorText = env.ERROR || '无法获取文件，检查路径或TOKEN是否正确。';
				// 如果请求不成功，返回适当的错误响应
				return new Response(errorText, { status: response.status });
			}

		} else {
			const envKey = env.URL302 ? 'URL302' : (env.URL ? 'URL' : null);
			if (envKey) {
				const URLs = await ADD(env[envKey]);
				const URL = URLs[Math.floor(Math.random() * URLs.length)];
				return envKey === 'URL302' ? Response.redirect(URL, 302) : fetch(new Request(URL, request));
			}
			//首页改成一个nginx伪装页
			return new Response(await nginx(), {
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		}
	}
};

async function nginx() {
  const text = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to nginx!</title>
    <style>
      :root {
        --primary-color: #2563eb;
        --secondary-color: #1e40af;
        --background-color: #f8fafc;
        --text-color: #1e293b;
      }

      body {
        margin: 0;
        padding: 2rem;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background-color: var(--background-color);
        color: var(--text-color);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .container {
        max-width: 800px;
        padding: 2rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: var(--primary-color);
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
        animation: fadeIn 1s ease-in-out;
      }

      p {
        font-size: 1.1rem;
        line-height: 1.6;
        margin: 1rem 0;
      }

      a {
        color: var(--primary-color);
        text-decoration: none;
        transition: color 0.2s;
      }

      a:hover {
        color: var(--secondary-color);
      }

      .links {
        margin-top: 2rem;
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        background: var(--primary-color);
        color: white;
        transition: all 0.2s;
      }

      .btn:hover {
        background: var(--secondary-color);
        transform: translateY(-2px);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to nginx!</h1>
      <p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>
      <div class="links">
        <a href="http://nginx.org/" class="btn">Documentation</a>
        <a href="http://nginx.com/" class="btn">Commercial Support</a>
      </div>
      <p style="margin-top: 2rem;"><em>Thank you for using nginx.</em></p>
    </div>
  </body>
  </html>
  `;
  return text;
}

async function ADD(envadd) {
	var addtext = envadd.replace(/[	|"'\r\n]+/g, ',').replace(/,+/g, ',');	// 将空格、双引号、单引号和换行符替换为逗号
	//console.log(addtext);
	if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length -1) == ',') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split(',');
	//console.log(add);
	return add ;
}
