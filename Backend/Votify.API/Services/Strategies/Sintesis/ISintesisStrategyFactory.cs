using Votify.API.Models.Domain;

namespace Votify.API.Services.Strategies.Sintesis;

public interface ISintesisStrategyFactory
{
    ISintesisStrategy Crear(TipoSintesis tipo);
}
