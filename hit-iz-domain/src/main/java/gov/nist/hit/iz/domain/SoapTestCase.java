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

package gov.nist.hit.iz.domain;

import gov.nist.hit.core.domain.SutType;
import gov.nist.hit.core.domain.TestStory;
import gov.nist.hit.core.domain.ObjectType;

import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Lob;
import javax.persistence.MappedSuperclass;
import javax.persistence.OneToOne;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @(#) TestPlan.java
 */
@MappedSuperclass
public class SoapTestCase implements java.io.Serializable {

  private static final long serialVersionUID = 1L;

  @Column(nullable = true)
  @Enumerated(EnumType.STRING)
  protected SutType sutType;

  @NotNull
  @Column(nullable = false)
  @JsonProperty("label")
  protected String name;

  protected String testType;

  protected String testPackagePath;

  transient protected ObjectType type = ObjectType.TestCase;

  protected int position;

  @Column(nullable = true)
  protected String parentName;

  @Column(columnDefinition = "TEXT")
  protected String instructionsText;

  @Lob
  @Basic(fetch = FetchType.EAGER)
  @Column(length = 100000, nullable = true)
  protected byte[] instructionsImage;

  @Lob
  @Basic(fetch = FetchType.EAGER)
  @Column(length = 100000, nullable = true)
  protected byte[] messageContentImage;

  @Lob
  @Basic(fetch = FetchType.EAGER)
  @Column(length = 100000, nullable = true)
  protected byte[] testDataSpecificationImage;

  @Lob
  @Basic(fetch = FetchType.EAGER)
  @Column(length = 100000, nullable = true)
  protected byte[] testDataSpecificationImage2;


  @OneToOne(cascade = CascadeType.PERSIST)
  protected TestStory testStory;

  public SoapTestCase() {
    super();
    testStory = new TestStory();
  }

  public void setName(String name) {
    this.name = name;
  }

  public SoapTestCase(String name) {
    setName(name);
  }

  public String getName() {
    return this.name;
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("Name: ").append(getName()).append(", ");
    return sb.toString();
  }

  public TestStory getTestStory() {
    return testStory;
  }

  public void setTestStory(TestStory testStory) {
    this.testStory = testStory;
  }

  public SutType getSutType() {
    return sutType;
  }

  public void setSutType(SutType sutType) {
    this.sutType = sutType;
  }

  public String getParentName() {
    return parentName;
  }

  public void setParentName(String parentName) {
    this.parentName = parentName;
  }

  public String getTestPackagePath() {
    return testPackagePath;
  }

  public void setTestPackagePath(String testPackagePath) {
    this.testPackagePath = testPackagePath;
  }

  public String getTestType() {
    return testType;
  }

  public void setTestType(String testType) {
    this.testType = testType;
  }

  public String getInstructionsText() {
    return instructionsText;
  }

  public void setInstructionsText(String instructionsText) {
    this.instructionsText = instructionsText;
  }

  public byte[] getInstructionsImage() {
    return instructionsImage;
  }

  public void setInstructionsImage(byte[] instructionsImage) {
    this.instructionsImage = instructionsImage;
  }

  public byte[] getMessageContentImage() {
    return messageContentImage;
  }

  public void setMessageContentImage(byte[] messageContentImage) {
    this.messageContentImage = messageContentImage;
  }

  public byte[] getTestDataSpecificationImage() {
    return testDataSpecificationImage;
  }

  public void setTestDataSpecificationImage(byte[] testDataSpecificationImage) {
    this.testDataSpecificationImage = testDataSpecificationImage;
  }

  public byte[] getTestDataSpecificationImage2() {
    return testDataSpecificationImage2;
  }

  public void setTestDataSpecificationImage2(byte[] testDataSpecificationImage2) {
    this.testDataSpecificationImage2 = testDataSpecificationImage2;
  }

  public ObjectType getType() {
    return type;
  }

  public int getPosition() {
    return position;
  }

  public void setPosition(int position) {
    this.position = position;
  }

}
