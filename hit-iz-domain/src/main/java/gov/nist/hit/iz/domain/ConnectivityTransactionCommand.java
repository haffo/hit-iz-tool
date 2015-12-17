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

import gov.nist.hit.core.domain.Command;


/**
 * @author Harold Affo (NIST)
 * 
 */
public class ConnectivityTransactionCommand extends Command {

  private static final long serialVersionUID = 1L;
  protected String incoming;
  protected String outgoing;
  protected String u; // username
  protected String p; // password
  protected String facilityId;

  public ConnectivityTransactionCommand() {
    super();
  }

  public ConnectivityTransactionCommand(String outgoing, String incoming) {
    this.incoming = incoming;
    this.outgoing = outgoing;
  }

  public String getIncoming() {
    return incoming;
  }

  public void setIncoming(String incoming) {
    this.incoming = incoming;
  }

  public String getOutgoing() {
    return outgoing;
  }

  public void setOutgoing(String outgoing) {
    this.outgoing = outgoing;
  }

  public String getU() {
    return u;
  }

  public void setU(String u) {
    this.u = u;
  }

  public String getP() {
    return p;
  }

  public void setP(String p) {
    this.p = p;
  }

  public String getFacilityId() {
    return facilityId;
  }

  public void setFacilityId(String facilityId) {
    this.facilityId = facilityId;
  }

}
