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

import gov.nist.hit.core.domain.TransactionStatus;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @(#) UserTransaction.java
 */
@Entity
public class ConnectivityTransaction implements java.io.Serializable {
  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  protected Long id;

  @Column(nullable = true)
  @Enumerated(EnumType.STRING)
  protected TransactionStatus status;

  @Column(nullable = true, columnDefinition = "LONGTEXT")
  protected String incoming;

  @Column(nullable = true, columnDefinition = "LONGTEXT")
  protected String outgoing;


  @JsonIgnore
  @OneToOne(optional = false, fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
  @JoinColumn(unique = true)
  protected ConnectivityUser user;

  public ConnectivityTransaction() {
    super();
    status = TransactionStatus.CLOSE;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public ConnectivityTransaction(String incoming, String outgoing) {
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

  public TransactionStatus getStatus() {
    return status;
  }

  public void setStatus(TransactionStatus status) {
    this.status = status;
  }

  public ConnectivityUser getUser() {
    return user;
  }

  public void setUser(ConnectivityUser user) {
    this.user = user;
  }

  public void close() {
    clear();
    this.status = TransactionStatus.CLOSE;
  }

  private void clear() {
    this.incoming = null;
    this.outgoing = null;
  }

  public void init() {
    clear();
    this.status = TransactionStatus.OPEN;
  }


}
