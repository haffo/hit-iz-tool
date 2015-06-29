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
package gov.nist.hit.iz.service;


/**
 * 
 * @author Harold Affo
 * 
 */
public abstract class TestPlanParser {


  // @Autowired
  // ProfileParser profileParser;
  //
  // @Autowired
  // ValueSetLibrarySerializer valueSetLibrarySerializer;
  //
  // @Autowired
  // IntegrationProfileRepository integrationProfileRepository;
  //
  // @Autowired
  // VocabularyLibraryRepository vocabularyLibraryRepository;
  //
  // @Autowired
  // MessageRepository messageRepository;
  //
  // @Autowired
  // ConstraintsRepository constraintsRepository;
  //
  // protected com.fasterxml.jackson.databind.ObjectMapper obm =
  // new com.fasterxml.jackson.databind.ObjectMapper();
  //
  //
  // public TestPlanParser() {
  // super();
  // obm.setSerializationInclusion(Include.NON_NULL);
  //
  // }
  //
  // public TestContext testContext(String path) throws IOException, ProfileParserException {
  // TestContext testContext = new TestContext();
  // testContext.setConstraints(constraint(getContent(path + "/Constraints.xml")));
  // IntegrationProfile p = integrationProfile(getContent(path + "/IntegrationProfile.xml"));
  // p.setJson(parseProfile(p.getXml(), testContext.getConstraints().getXml()));
  // testContext.setProfile(p);
  // testContext.setMessage(message(getContent(path + "/Message.txt")));
  // VocabularyLibrary vocabLibrary = vocabLibrary(getContent(path + "/ValueSetLibrary.xml"));
  // testContext.setVocabularyLibrary(vocabLibrary);
  // return testContext;
  // }
  //
  // public String parseProfile(String profile, String constraints) throws JsonProcessingException,
  // ProfileParserException, com.fasterxml.jackson.core.JsonProcessingException {
  // return obm.writeValueAsString(profileParser.parse(profile, constraints));
  // }
  //
  //
  //
  // public VocabularyLibrary vocabLibrary(String content) throws JsonGenerationException,
  // JsonMappingException, IOException {
  // Document doc = this.stringToDom(content);
  // VocabularyLibrary vocabLibrary = new VocabularyLibrary();
  // Element valueSetLibraryeElement = (Element)
  // doc.getElementsByTagName("ValueSetLibrary").item(0);
  // vocabLibrary.setSourceId(valueSetLibraryeElement.getAttribute("ValueSetLibraryIdentifier"));
  // vocabLibrary.setName(valueSetLibraryeElement.getAttribute("Name"));
  // vocabLibrary.setDescription(valueSetLibraryeElement.getAttribute("Description"));
  // vocabLibrary.setXml(content);
  // vocabLibrary.setJson(obm.writeValueAsString(valueSetLibrarySerializer.toObject(content)));
  // vocabularyLibraryRepository.save(vocabLibrary);
  //
  // return vocabLibrary;
  // }
  //
  //
  //
  // public IntegrationProfile integrationProfile(String content) {
  // Document doc = this.stringToDom(content);
  // IntegrationProfile integrationProfile = new IntegrationProfile();
  // Element profileElement = (Element) doc.getElementsByTagName("IntegrationProfile").item(0);
  // integrationProfile.setType(profileElement.getAttribute("Type"));
  // integrationProfile.setHl7Version(profileElement.getAttribute("HL7Version"));
  // integrationProfile.setSchemaVersion(profileElement.getAttribute("SchemaVersion"));
  // integrationProfile.setSourceId(profileElement.getAttribute("ID"));
  // Element metaDataElement = (Element) profileElement.getElementsByTagName("Metadata").item(0);
  // integrationProfile.setName(metaDataElement.getAttribute("Name"));
  // integrationProfile.setXml(content);
  // integrationProfileRepository.save(integrationProfile);
  // return integrationProfile;
  // }
  //
  //
  // public Message message(String content) {
  // if (content != null) {
  // Message m = new Message();
  // m.setContent(content);
  // messageRepository.save(m);
  // return m;
  // }
  // return null;
  // }
  //
  //
  // public Constraints constraint(String content) {
  // Document doc = this.stringToDom(content);
  // Constraints constraints = new Constraints();
  // Element constraintsElement = (Element) doc.getElementsByTagName("ConformanceContext").item(0);
  // constraints.setSourceId(constraintsElement.getAttribute("UUID"));
  // Element metaDataElement = (Element)
  // constraintsElement.getElementsByTagName("MetaData").item(0);
  // constraints.setDescription(metaDataElement.getAttribute("Description"));
  // constraints.setXml(content);
  // constraintsRepository.save(constraints);
  // return constraints;
  // }
  //
  // private Document stringToDom(String xmlSource) {
  // DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
  // factory.setNamespaceAware(true);
  // factory.setIgnoringComments(false);
  // factory.setIgnoringElementContentWhitespace(true);
  // DocumentBuilder builder;
  // try {
  // builder = factory.newDocumentBuilder();
  // return builder.parse(new InputSource(new StringReader(xmlSource)));
  // } catch (ParserConfigurationException e) {
  // e.printStackTrace();
  // } catch (SAXException e) {
  // e.printStackTrace();
  // } catch (IOException e) {
  // e.printStackTrace();
  // }
  // return null;
  // }
  //
  // public String getContent(String path) throws IOException {
  // String content = null;
  // content = IOUtils.toString(CBTestPlanParser.class.getResourceAsStream(path));
  // return content;
  // }
  //
  // public boolean exists(String location) {
  // File file = new File(location);
  // return file.exists();
  // }
  //


}
