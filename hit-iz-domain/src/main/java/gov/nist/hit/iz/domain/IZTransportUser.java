package gov.nist.hit.iz.domain;

import gov.nist.hit.core.transport.TransportUser;

import javax.persistence.Column;
import javax.persistence.Entity;

@Entity
public class IZTransportUser extends TransportUser implements java.io.Serializable {

  private static final long serialVersionUID = 1L;

  @Column(nullable = true)
  protected String facilityID;

  public String getFacilityID() {
    return facilityID;
  }

  public void setFacilityID(String facilityID) {
    this.facilityID = facilityID;
  }



}
