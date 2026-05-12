using Votify.API.Models.Domain;

namespace Votify.API.Services.Strategies.Sintesis
{
    public class SintesisStrategyFactory
    {
        private readonly SintesisJuradoStrategy _jurado;
        private readonly SintesisPublicoStrategy _publico;

        public SintesisStrategyFactory(SintesisJuradoStrategy jurado, SintesisPublicoStrategy publico)
        {
            _jurado = jurado;
            _publico = publico;
        }

        public virtual ISintesisStrategy Crear(TipoSintesis tipo) => tipo switch
        {
            TipoSintesis.Jurado => _jurado,
            TipoSintesis.Publico => _publico,
            _ => throw new ArgumentOutOfRangeException(nameof(tipo), tipo, "Tipo de síntesis no soportado.")
        };
    }
}
