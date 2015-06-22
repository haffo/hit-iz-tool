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

package gov.nist.hit.iz.web.model;

/**
 * @author Harold Affo(NIST)
 * 
 */
public class SearchTableCommand {

  private String searchString;
  private String selectionCriteria;

  private Long vocabCollectionId;
  private Long vocabLibraryId;
  private String tableNumber;
  private String valueSetName;
  private Long testContextId;

  public SearchTableCommand() {
    super();
    // TODO Auto-generated constructor stub
  }

  public SearchTableCommand(String searchString, String selectionCriteria) {
    super();
    this.searchString = searchString;
    this.selectionCriteria = selectionCriteria;
  }

  public String getSearchString() {
    return searchString;
  }

  public void setSearchString(String searchString) {
    this.searchString = searchString;
  }

  public String getSelectionCriteria() {
    return selectionCriteria;
  }

  public void setSelectionCriteria(String selectionCriteria) {
    this.selectionCriteria = selectionCriteria;
  }

  public Long getVocabCollectionId() {
    return vocabCollectionId;
  }

  public void setVocabCollectionId(Long vocabCollectionId) {
    this.vocabCollectionId = vocabCollectionId;
  }

  public Long getVocabLibraryId() {
    return vocabLibraryId;
  }

  public void setVocabLibraryId(Long vocabLibraryId) {
    this.vocabLibraryId = vocabLibraryId;
  }

  public String getTableNumber() {
    return tableNumber;
  }

  public void setTableNumber(String tableNumber) {
    this.tableNumber = tableNumber;
  }

  public String getValueSetName() {
    return valueSetName;
  }

  public void setValueSetName(String valueSetName) {
    this.valueSetName = valueSetName;
  }

  public Long getTestContextId() {
    return testContextId;
  }

  public void setTestContextId(Long testContextId) {
    this.testContextId = testContextId;
  }

}
