package gov.nist.hit.iz.web.config;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.apache.log4j.PropertyConfigurator;

/**
 * @author Harold Affo (NIST)
 */
@WebListener
public class Log4jConfigListener implements ServletContextListener {

  @Override
  public void contextInitialized(ServletContextEvent sce) {
    try {
      Properties p = new Properties();
      InputStream log4jFile =
          Log4jConfigListener.class.getResourceAsStream("/iztool-log4j.properties");
      p.load(log4jFile);
      String logDir = sce.getServletContext().getRealPath("/logs");

      File f = new File(logDir);
      if (!f.exists()) {
        f.mkdir();
      }
      p.put("log.dir", logDir);
      PropertyConfigurator.configure(p);
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {
    // TODO Auto-generated method stub
  }

}
