$ErrorActionPreference = 'Stop'
$project = 'rgi-verify-' + [guid]::NewGuid().ToString('N').Substring(0,8)
if ($project -notmatch '^rgi-verify-[a-f0-9]{8}$') { throw 'Invalid isolated test project' }
$env:POSTGRES_PASSWORD = [guid]::NewGuid().ToString('N')
$env:DJANGO_SECRET_KEY = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
$env:RATE_LIMIT_SECRET = [guid]::NewGuid().ToString('N')
$env:ADMIN_TOKEN = [guid]::NewGuid().ToString('N')
$env:DJANGO_ALLOWED_HOSTS = 'robogoalindia.com,localhost,backend,127.0.0.1'
$env:DJANGO_CSRF_TRUSTED_ORIGINS = 'https://robogoalindia.com'
$env:NEXT_PUBLIC_SITE_URL = 'https://robogoalindia.com'
$env:TRUSTED_EDGE_CIDR = '127.0.0.1/32'
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,0)
$listener.Start()
$env:HTTP_PORT = $listener.LocalEndpoint.Port.ToString()
$listener.Stop()
$compose = @('compose','--project-name',$project,'--env-file','.env.docker.example')
Write-Output "Isolated test project: $project (port $env:HTTP_PORT)"
try {
  & docker @compose config --quiet
  if ($LASTEXITCODE) { throw 'Compose validation failed' }
  & docker @compose build
  if ($LASTEXITCODE) { throw 'Image build failed' }
  & docker @compose up -d --wait --wait-timeout 180
  if ($LASTEXITCODE) { throw 'Container startup failed' }
  $headers = @{Host='robogoalindia.com'; 'X-Forwarded-Proto'='https'}
  $origin = 'http://127.0.0.1:' + $env:HTTP_PORT
  foreach ($route in @('/','/tour','/contact','/gallery','/fixtures','/blog','/sitemap.xml','/cms-admin/login/','/django-static/admin/css/base.css')) {
    $response = Invoke-WebRequest -Uri ($origin+$route) -Headers $headers -UseBasicParsing
    if ($response.StatusCode -ne 200) { throw "Failed route $route" }
  }
  & docker @compose exec -T backend python manage.py shell -c "from cms.models import SiteSettings; SiteSettings.objects.update_or_create(pk=1,defaults={'cities':42,'robots_built':0,'email':'docker-probe@example.com'})"
  if ($LASTEXITCODE) { throw 'Could not seed isolated CMS settings' }
  $homepageResponse = Invoke-WebRequest -Uri ($origin+'/') -Headers $headers -UseBasicParsing
  if ($homepageResponse.Content -notmatch 'data-value="42"' -or $homepageResponse.Content -notmatch 'docker-probe@example.com') { throw 'CMS update did not reach frontend' }
  & docker @compose exec -T backend python manage.py test cms --noinput
  if ($LASTEXITCODE) { throw 'Django PostgreSQL tests failed' }
  & docker @compose exec -T backend python manage.py check --deploy --fail-level ERROR
  if ($LASTEXITCODE) { throw 'Deployment checks failed' }
  & docker @compose ps
  Write-Output 'PASS: Docker build, PostgreSQL migrations, static init, health checks, Django admin, public pages and live CMS settings'
} catch {
  & docker @compose logs --tail 60
  throw
} finally {
  # Only containers and volumes in the freshly generated test project are removed.
  & docker @compose down --volumes --remove-orphans
}
