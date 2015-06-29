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
package gov.nist.healthcare.hl7.v2.iz.tool.web.unit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;
import gov.nist.hit.core.domain.Command;
import gov.nist.hit.iz.service.XmlMessageParserImpl;
import gov.nist.hit.iz.web.controller.XmlMessageController;

import java.io.IOException;

import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * @author Harold Affo
 * 
 */
public class XmlMessageControllerTest {

  @InjectMocks
  XmlMessageController xmlMessageController;

  MockMvc mockMvc;

  @Rule
  public ExpectedException thrown = ExpectedException.none();

  @Before
  public void setup() {
    MockitoAnnotations.initMocks(this);
    xmlMessageController.setParser(new XmlMessageParserImpl());
    mockMvc = standaloneSetup(xmlMessageController).build();
  }

  /**
   * Get a integrationProfile model as json
   * 
   * @throws Exception
   */
  @Test
  public void testParse() throws Exception {
    Command command = new Command(getContent());
    ObjectMapper objectMapper = new ObjectMapper();
    // valid request object
    String jsonText = objectMapper.writeValueAsString(command);
    // MvcResult mvcResult = mockMvc
    // .perform(
    // post("/soapCommon/parse").content(jsonText)
    // .contentType(MediaType.APPLICATION_JSON))
    // .andExpect(request().asyncStarted()).andReturn();
    // this.mockMvc.perform(asyncDispatch(mvcResult))
    // .andExpect(status().isOk()).andDo(print());

    mockMvc.perform(post("/soap/parse").contentType(MediaType.APPLICATION_JSON).content(jsonText))
        .andExpect(status().isOk()).andDo(print());

  }

  @Test
  public void testFormat() throws Exception {
    Command command = new Command(getContent2());
    ObjectMapper objectMapper = new ObjectMapper();
    // valid request object
    String jsonText = objectMapper.writeValueAsString(command);
    mockMvc.perform(post("/soap/format").contentType(MediaType.APPLICATION_JSON).content(jsonText))
        .andExpect(status().isOk()).andDo(print());
  }

  public String getContent() throws IOException {
    return IOUtils.toString(XmlMessageControllerTest.class
        .getResourceAsStream("/soapMessages/1.xml"));
  }

  public String getContent2() throws IOException {
    return IOUtils.toString(XmlMessageControllerTest.class
        .getResourceAsStream("/soapMessages/2.xml"));
  }

}
