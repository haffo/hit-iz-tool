/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified.
 */

package gov.nist.hit.iz.web.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import com.fasterxml.jackson.core.JsonProcessingException;

import gov.nist.hit.core.hl7v2.service.HL7V2MessageParser;
import gov.nist.hit.core.hl7v2.service.HL7V2MessageValidator;
import gov.nist.hit.core.hl7v2.service.HL7V2ValidationReportConverter;
import gov.nist.hit.core.hl7v2.service.impl.HL7V2MessageParserImpl;
import gov.nist.hit.core.hl7v2.service.impl.HL7V2ResourceLoaderImpl;
import gov.nist.hit.core.hl7v2.service.impl.HL7V2ValidationReportConverterImpl;
import gov.nist.hit.core.service.ResourceLoader;
import gov.nist.hit.core.service.exception.ProfileParserException;
import gov.nist.hit.iz.service.IZHL7V2MessageValidatorImpl;
import gov.nist.hit.iz.service.SOAPValidationReportGenerator;
import gov.nist.hit.iz.service.soap.SOAPValidationReportGeneratorImpl;

/**
 * @author Harold Affo (NIST)
 * 
 */

@Configuration
@PropertySource(value = { "classpath:app-config.properties" })
public class IZWebBeanConfig {

	@Value("${app.organization.name:'NIST'}")
	private String organizationName;

	@Bean
	public HL7V2MessageValidator hl7v2MessageValidator() {
		IZHL7V2MessageValidatorImpl validator = new IZHL7V2MessageValidatorImpl();
		validator.setOrganizationName(organizationName);
		return validator;
	}

	@Bean
	public HL7V2MessageParser hl7v2MessageParser() {
		return new HL7V2MessageParserImpl();
	}

	@Bean
	public ResourceLoader resourceLoader() throws JsonProcessingException, ProfileParserException, IOException {
		HL7V2ResourceLoaderImpl rs = new HL7V2ResourceLoaderImpl();
		return rs;
	}

	@Bean
	public SOAPValidationReportGenerator soapValidationReportGenerator() {
		return new SOAPValidationReportGeneratorImpl();
	}

	@Bean
	public HL7V2ValidationReportConverter validationReportConverter() {
		return new HL7V2ValidationReportConverterImpl();
	}

}
