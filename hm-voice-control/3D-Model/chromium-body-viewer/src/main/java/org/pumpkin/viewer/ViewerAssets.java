package org.pumpkin.viewer;

import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

/** Classpath-only, loopback asset host: works from both source and packaged JARs. */
final class ViewerAssets implements AutoCloseable {
    private static final Map<String, String> FILES = Map.ofEntries(
        Map.entry("index.html", "text/html"), Map.entry("viewer.css", "text/css"),
        Map.entry("js/body3d.js", "text/javascript"), Map.entry("js/host.js", "text/javascript"),
        Map.entry("vendor/three.module.js", "text/javascript"),
        Map.entry("assets/body.bin", "application/octet-stream"), Map.entry("assets/body.json", "application/json"),
        Map.entry("assets/systems.json", "application/json"),
        Map.entry("assets/fonts/inter-latin-400-normal.woff2", "font/woff2"),
        Map.entry("assets/fonts/inter-latin-600-normal.woff2", "font/woff2"));
    private final HttpServer server;
    private final ExecutorService executor = Executors.newCachedThreadPool(r -> { Thread t = new Thread(r, "viewer-assets"); t.setDaemon(true); return t; });
    private final String prefix = "/" + UUID.randomUUID() + "/";
    ViewerAssets() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.setExecutor(executor);
        server.createContext("/", exchange -> {
            try (exchange) {
                String path = exchange.getRequestURI().getPath();
                String file = path.startsWith(prefix) ? path.substring(prefix.length()) : "";
                if (!exchange.getRequestMethod().equals("GET") || !FILES.containsKey(file)) {
                    exchange.sendResponseHeaders(404, -1); return;
                }
                byte[] bytes;
                try (InputStream in = ViewerAssets.class.getResourceAsStream("/viewer/" + file)) {
                    if (in == null) { exchange.sendResponseHeaders(404, -1); return; }
                    bytes = in.readAllBytes();
                }
                exchange.getResponseHeaders().set("Content-Type", FILES.get(file));
                exchange.getResponseHeaders().set("Cache-Control", "no-store");
                exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
                exchange.getResponseHeaders().set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'");
                exchange.sendResponseHeaders(200, bytes.length);
                exchange.getResponseBody().write(bytes);
            }
        });
        server.start();
    }
    String url() { return "http://127.0.0.1:" + server.getAddress().getPort() + prefix + "index.html"; }
    @Override public void close() { server.stop(0); executor.shutdownNow(); }
}
