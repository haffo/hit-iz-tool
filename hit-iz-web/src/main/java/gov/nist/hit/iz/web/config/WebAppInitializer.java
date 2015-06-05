/**
 * This software was developed at the National Institute of Standards and Technology by employees
 * of the Federal Government in the course of their official duties. Pursuant to title 17 Section 105 of the
 * United States Code this software is not subject to copyright protection and is in the public domain.
 * This is an experimental system. NIST assumes no responsibility whatsoever for its use by other parties,
 * and makes no guarantees, expressed or implied, about its quality, reliability, or any other characteristic.
 * We would appreciate acknowledgement if the software is used. This software can be redistributed and/or
 * modified freely provided that any derivative works bear some notice that they are derived from it, and any
 * modified versions bear some notice that they have been modified.
 */
package gov.nist.hit.iz.web.config;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration.Dynamic;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.ws.transport.http.MessageDispatcherServlet;

public class WebAppInitializer implements WebApplicationInitializer

{

	@Override
	public void onStartup(final ServletContext servletContext)
			throws ServletException {

		final AnnotationConfigWebApplicationContext root = new AnnotationConfigWebApplicationContext();
		root.setServletContext(servletContext);
		root.scan("gov.nist.hit.iz");
		// web app servlet
		servletContext.addListener(new ContextLoaderListener(root));
		Dynamic servlet = servletContext.addServlet("iztool-web",
				new DispatcherServlet(root));
		servlet.setLoadOnStartup(1);
		servlet.addMapping("/api/*");
		servlet.setAsyncSupported(true);

		// web service servlet
		MessageDispatcherServlet dispatcher = new MessageDispatcherServlet(root);
		dispatcher.setTransformWsdlLocations(true);
		final Dynamic webservices = servletContext.addServlet("iztool-ws",
				dispatcher);
		webservices.setLoadOnStartup(2);
		webservices.addMapping("/ws/*");
		webservices.addMapping("*.wsdl");

	}

}
