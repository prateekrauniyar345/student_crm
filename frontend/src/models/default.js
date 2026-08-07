class Default {
  constructor({
    message,
    status,
    version,
    date,
    version_tag,
    docs_url
  }) {
    this.message = message;
    this.status = status;
    this.version = version;
    this.date = date;
    this.version_tag = version_tag;
    this.docs_url = docs_url;
  }

  static fromApiResponse(data) {
    return new Default(data);
  }

  toJSON() {
    return {
      message: this.message,
      status: this.status,
      version: this.version,
      date: this.date,
      version_tag: this.version_tag,
      docs_url: this.docs_url
    };
  }
}

export default Default;