package org.hm.desktop;

import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/** Bundled Next.js static export, served on loopback only. No Node process is used. */
final class StaticSite implements AutoCloseable {
    private final HttpServer server;
    private final Set<String> files;
    private final ExecutorService executor=Executors.newFixedThreadPool(4,r->{var t=new Thread(r,"desktop-assets");t.setDaemon(true);return t;});
    private final AtomicBoolean stopped=new AtomicBoolean();
    StaticSite()throws IOException{
        try(var in=StaticSite.class.getResourceAsStream("/ui-files.txt")){
            if(in==null)throw new IOException("Missing UI export. Run the root build script first.");
            files=Set.copyOf(new String(in.readAllBytes(),StandardCharsets.UTF_8).lines().filter(s->!s.isBlank()).toList());
        }
        if(!files.contains("index.html"))throw new IOException("UI export has no index.html");
        server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);server.setExecutor(executor);
        server.createContext("/",exchange->{
            try(exchange){
                if(!Set.of("GET","HEAD").contains(exchange.getRequestMethod())){exchange.sendResponseHeaders(405,-1);return;}
                String file=resolve(exchange.getRequestURI().getPath(),files);
                if(file==null){exchange.sendResponseHeaders(404,-1);return;}
                byte[] data;
                try(var in=StaticSite.class.getResourceAsStream("/ui/"+file)){
                    if(in==null){exchange.sendResponseHeaders(404,-1);return;}data=in.readAllBytes();
                }
                var h=exchange.getResponseHeaders();h.set("Content-Type",type(file));h.set("X-Content-Type-Options","nosniff");
                h.set("Cache-Control","no-store");
                h.set("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; object-src 'none'");
                if(exchange.getRequestMethod().equals("HEAD")){h.set("Content-Length",Integer.toString(data.length));exchange.sendResponseHeaders(200,-1);}
                else{exchange.sendResponseHeaders(200,data.length);exchange.getResponseBody().write(data);}
            }
        });server.start();
    }
    static String resolve(String path,Set<String> files){
        if(path==null||!path.startsWith("/")||path.contains("\\")||Arrays.asList(path.split("/")).contains(".."))return null;
        String p=path.substring(1);if(p.isEmpty()||p.endsWith("/"))p+="index.html";
        if(files.contains(p))return p;
        if(files.contains(p+"/index.html"))return p+"/index.html";
        return null;
    }
    String url(){return "http://127.0.0.1:"+server.getAddress().getPort()+"/";}
    boolean owns(String url){try{var u=URI.create(url);var own=URI.create(url());return "http".equals(u.getScheme())&&own.getHost().equals(u.getHost())&&u.getPort()==own.getPort()&&u.getUserInfo()==null;}catch(RuntimeException e){return false;}}
    private static String type(String p){
        if(p.endsWith(".html"))return "text/html; charset=utf-8";if(p.endsWith(".js"))return "text/javascript; charset=utf-8";
        if(p.endsWith(".css"))return "text/css; charset=utf-8";if(p.endsWith(".json"))return "application/json";
        if(p.endsWith(".svg"))return "image/svg+xml";if(p.endsWith(".png"))return "image/png";if(p.endsWith(".jpg")||p.endsWith(".jpeg"))return "image/jpeg";
        if(p.endsWith(".woff2"))return "font/woff2";if(p.endsWith(".woff"))return "font/woff";if(p.endsWith(".ico"))return "image/x-icon";
        if(p.endsWith(".txt"))return "text/plain; charset=utf-8";return "application/octet-stream";
    }
    @Override public void close(){if(stopped.compareAndSet(false,true)){server.stop(0);executor.shutdownNow();}}
}
