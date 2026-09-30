import uvicorn
import webbrowser
import threading
import time
import socket

def find_available_port(default_port=8000, max_tries=20):
    """Trouve un port disponible en commençant par default_port."""
    for p in range(default_port, default_port + max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", p))
                return p
            except OSError:
                continue
    return default_port

def open_browser(port):
    time.sleep(1.2)
    url = f"http://127.0.0.1:{port}"
    print(f"\n[INFO] Ouverture automatique dans votre navigateur : {url}\n")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"[NOTE] Veuillez ouvrir manuellement votre navigateur sur {url} ({e})")

if __name__ == "__main__":
    port = find_available_port(8000)
    print("=" * 70)
    print("  COMPARATEUR INDÉPENDANT D'OFFRES TOURISTIQUES")
    print("  Application fonctionnelle pour voyageurs et conseillers en voyages")
    print(f"  Serveur actif sur : http://127.0.0.1:{port}")
    print("=" * 70)
    
    threading.Thread(target=open_browser, args=(port,), daemon=True).start()
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=False)
