package gov.nist.hit.iz.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class ConnectivityUser implements java.io.Serializable {

  private static final long serialVersionUID = 1L;
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  protected Long id;

  @Column(nullable = true, unique = true)
  protected String username;

  @Column(nullable = true)
  protected String password;

  @Column(nullable = true)
  protected String facilityID; 
  
  @Column(nullable = true)
  protected Long responseMessageId;  

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getFacilityID() {
    return facilityID;
  }

  public void setFacilityID(String facilityID) {
    this.facilityID = facilityID;
  }

  public Long getResponseMessageId() {
    return responseMessageId;
  }

  public void setResponseMessageId(Long responseMessageId) {
    this.responseMessageId = responseMessageId;
  }

  
  
  
  
  

}
