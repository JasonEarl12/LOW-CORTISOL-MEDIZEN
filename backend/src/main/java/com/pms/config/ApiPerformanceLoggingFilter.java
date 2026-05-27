package com.pms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ApiPerformanceLoggingFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(ApiPerformanceLoggingFilter.class);
  private static final long SLOW_REQUEST_MS = 1500L;

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String uri = request.getRequestURI();
    return uri == null || !uri.startsWith("/api/");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {
    long startNanos = System.nanoTime();
    try {
      filterChain.doFilter(request, response);
    } finally {
      long elapsedMs = (System.nanoTime() - startNanos) / 1_000_000;
      if (elapsedMs >= SLOW_REQUEST_MS) {
        log.warn("Slow API request: method={} path={} query={} status={} durationMs={}",
          request.getMethod(),
          request.getRequestURI(),
          request.getQueryString(),
          response.getStatus(),
          elapsedMs
        );
      }
    }
  }
}
