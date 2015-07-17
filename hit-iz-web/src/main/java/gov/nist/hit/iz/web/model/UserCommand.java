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
public class UserCommand {
  protected String username;
  protected String password;
  protected String tokenId;
  protected String facilityID;
  protected String faultUsername;
  protected String faultPassword;
  protected String endpoint;

  public UserCommand() {
    super();
    // TODO Auto-generated constructor stub
  }

  public UserCommand(String username, String password, String faultUsername, String faultPassword,
      String facilityID, String endpoint) {
    super();
    this.username = username;
    this.password = password;
    this.faultUsername = faultUsername;
    this.faultPassword = faultPassword;
    this.facilityID = facilityID;
    this.endpoint = endpoint;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getTokenId() {
    return tokenId;
  }

  public void setTokenId(String tokenId) {
    this.tokenId = tokenId;
  }

  public String getFaultUsername() {
    return faultUsername;
  }

  public void setFaultUsername(String faultUsername) {
    this.faultUsername = faultUsername;
  }

  public String getFaultPassword() {
    return faultPassword;
  }

  public void setFaultPassword(String faultPassword) {
    this.faultPassword = faultPassword;
  }

  public String getFacilityID() {
    return facilityID;
  }

  public void setFacilityID(String facilityID) {
    this.facilityID = facilityID;
  }

  public String getEndpoint() {
    return endpoint;
  }

  public void setEndpoint(String endpoint) {
    this.endpoint = endpoint;
  }



}
