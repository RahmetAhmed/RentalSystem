using MiniRent.Backend.DTOs.Search;

namespace MiniRent.Backend.Services.Interfaces
{
    public interface ISearchService
    {
        SearchDto Search(string query);
    }
}
