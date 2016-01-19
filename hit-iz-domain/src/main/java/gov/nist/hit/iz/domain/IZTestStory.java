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

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class IZTestStory  implements Serializable {

 
  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id;

  @Column(columnDefinition = "TEXT")
  private String comments;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(columnDefinition = "TEXT")
  private String preCondition;

  @Column(columnDefinition = "TEXT")
  private String postCondition;

  @Column(columnDefinition = "TEXT")
  private String testObjectives;

  @Column(columnDefinition = "TEXT")
  private String noteToTesters; 
  
  @Column(columnDefinition = "TEXT")
  private String evaluationCriteria;
  

  private String pdfPath;

  private String htmlPath;

  public IZTestStory(String description, String comments, String preCondition, String postCondition,
      String testObjectives, String notes) {
    super();
    this.description = description;
    this.comments = comments;
    this.preCondition = preCondition;
    this.postCondition = postCondition;
    this.testObjectives = testObjectives;
    this.notes = notes;
  }

  public IZTestStory() {
    super();
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getComments() {
    return comments;
  }

  public void setComments(String comments) {
    this.comments = comments;
  }

  public String getPreCondition() {
    return preCondition;
  }

  public void setPreCondition(String preCondition) {
    this.preCondition = preCondition;
  }

  public String getPostCondition() {
    return postCondition;
  }

  public void setPostCondition(String postCondition) {
    this.postCondition = postCondition;
  }

  public String getTestObjectives() {
    return testObjectives;
  }

  public void setTestObjectives(String testObjectives) {
    this.testObjectives = testObjectives;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public String getNoteToTesters() {
    return noteToTesters;
  }

  public void setNoteToTesters(String noteToTesters) {
    this.noteToTesters = noteToTesters;
  }

  public String getPdfPath() {
    return pdfPath;
  }

  public void setPdfPath(String pdfPath) {
    this.pdfPath = pdfPath;
  }

  public String getHtmlPath() {
    return htmlPath;
  }

  public void setHtmlPath(String htmlPath) {
    this.htmlPath = htmlPath;
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((comments == null) ? 0 : comments.hashCode());
    result = prime * result + ((description == null) ? 0 : description.hashCode());
    result = prime * result + ((htmlPath == null) ? 0 : htmlPath.hashCode());
    result = prime * result + ((noteToTesters == null) ? 0 : noteToTesters.hashCode());
    result = prime * result + ((notes == null) ? 0 : notes.hashCode());
    result = prime * result + ((pdfPath == null) ? 0 : pdfPath.hashCode());
    result = prime * result + ((postCondition == null) ? 0 : postCondition.hashCode());
    result = prime * result + ((preCondition == null) ? 0 : preCondition.hashCode());
    result = prime * result + ((testObjectives == null) ? 0 : testObjectives.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    IZTestStory other = (IZTestStory) obj;
    if (comments == null) {
      if (other.comments != null)
        return false;
    } else if (!comments.equals(other.comments))
      return false;
    if (description == null) {
      if (other.description != null)
        return false;
    } else if (!description.equals(other.description))
      return false;
    if (htmlPath == null) {
      if (other.htmlPath != null)
        return false;
    } else if (!htmlPath.equals(other.htmlPath))
      return false;
    if (noteToTesters == null) {
      if (other.noteToTesters != null)
        return false;
    } else if (!noteToTesters.equals(other.noteToTesters))
      return false;
    if (notes == null) {
      if (other.notes != null)
        return false;
    } else if (!notes.equals(other.notes))
      return false;
    if (pdfPath == null) {
      if (other.pdfPath != null)
        return false;
    } else if (!pdfPath.equals(other.pdfPath))
      return false;
    if (postCondition == null) {
      if (other.postCondition != null)
        return false;
    } else if (!postCondition.equals(other.postCondition))
      return false;
    if (preCondition == null) {
      if (other.preCondition != null)
        return false;
    } else if (!preCondition.equals(other.preCondition))
      return false;
    if (testObjectives == null) {
      if (other.testObjectives != null)
        return false;
    } else if (!testObjectives.equals(other.testObjectives))
      return false;
    return true;
  }

}
