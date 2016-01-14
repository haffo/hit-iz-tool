package gov.nist.hit.iz.domain;

import gov.nist.hit.core.domain.Message;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

@Entity
public class IZEnvelopeTestContext implements java.io.Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  protected Long id;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  @Column(nullable = true)
  protected String validationPhase;

  @OneToOne(cascade = CascadeType.ALL)
  @JoinColumn(unique = true, nullable = true, insertable = true, updatable = true)
  protected Message exampleMessage;

  public String getValidationPhase() {
    return validationPhase;
  }

  public void setValidationPhase(String validationPhase) {
    this.validationPhase = validationPhase;
  }

  public Message getExampleMessage() {
    return exampleMessage;
  }

  public void setExampleMessage(Message exampleMessage) {
    this.exampleMessage = exampleMessage;
  }

}
