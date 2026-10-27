from ipaddress import ip_address

def client_ip(request):
    # Only private Nginx can reach Gunicorn and overwrites this header.
    value = request.META.get("HTTP_X_FORWARDED_FOR") or request.META.get("REMOTE_ADDR")
    try:
        return str(ip_address(value))
    except (ValueError, TypeError):
        return None
