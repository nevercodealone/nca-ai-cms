class Slug {
  value;
  constructor(input) {
    this.value = Slug.generate(input);
  }
  static generate(input) {
    return input.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  }
  toString() {
    return this.value;
  }
  equals(other) {
    return this.value === other.value;
  }
}

export { Slug as S };
