package org.pumpkin.viewer;

import me.friwi.jcefmaven.CefAppBuilder;
import org.cef.CefApp;
import java.nio.file.*;

/** One per process. Initialize before creating views; dispose after all views close. */
public final class ChromiumRuntime implements AutoCloseable {
    final CefApp app;
    private final java.util.concurrent.atomic.AtomicBoolean closing = new java.util.concurrent.atomic.AtomicBoolean();
    private ChromiumRuntime(CefApp app) { this.app = app; }
    public static ChromiumRuntime open(Path directory, String... chromiumArguments) throws Exception {
        Files.createDirectories(directory);
        CefAppBuilder builder = new CefAppBuilder();
        builder.setInstallDir(directory.resolve("jcef").toFile());
        builder.getCefSettings().windowless_rendering_enabled = true;
        builder.getCefSettings().root_cache_path = directory.resolve("cache").toAbsolutePath().toString();
        builder.getCefSettings().cache_path = directory.resolve("cache/default").toAbsolutePath().toString();
        builder.addJcefArgs("--disable-background-networking", "--disable-component-update", "--no-first-run");
        builder.addJcefArgs(chromiumArguments);
        return new ChromiumRuntime(builder.build());
    }
    @Override public void close() {
        // CEF cleanup also runs on AWT; dispatch there to avoid AWT/JavaFX lock inversion.
        if(closing.compareAndSet(false,true)) java.awt.EventQueue.invokeLater(app::dispose);
    }
}
