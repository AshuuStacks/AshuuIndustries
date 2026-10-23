import java.sql.*;
import java.util.Scanner;

public class InterfaceClient {
    private static final String urlDB = "jdbc:postgresql://localhost:5432/db_evenements";
    private Scanner scanner = new Scanner(System.in);
    private Connection connection;
    private int idUtilisateurConnecte;
    private PreparedStatement psInscrire;
    private PreparedStatement psConnexion;
    private PreparedStatement psVisualiserFestival;
    public InterfaceClient() {
        initialiserConnection();
        initialiserPreparedStatement();
        menuDemarrage();
    }

    private void initialiserConnection(){
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }

        try {
            connection = DriverManager.getConnection(urlDB,"invite","invite");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private void initialiserPreparedStatement(){
        try {
            psInscrire = connection.prepareStatement("SELECT gestion_evenements.inscrire_client(?,?,?)");
            psConnexion = connection
                    .prepareStatement("SELECT id_client,mot_de_passe FROM gestion_evenements.clients WHERE nom_utilisateur = ?");
            psVisualiserFestival = connection.prepareStatement("SELECT id_festival, nom, date_debut, date_fin, prix_total " +
                                                                    "FROM gestion_evenements.festival_view " +
                                                                    "ORDER BY date_debut");
        } catch (SQLException e) {
            quitter();
            throw new RuntimeException(e);
        }

    }

    public void menuDemarrage() {
        int choix = 0;
        while (true) {
            System.out.println("Que souhaitez-vous faire ?");
            System.out.println("1. S'inscrire");
            System.out.println("2. Se Connecter");
            System.out.println("Autre -> quitter");
            choix = lireNombre("Entrez votre choix");
            switch (choix) {
                case 1:
                    inscrire();
                    break;
                case 2:
                    connecter();
                    break;
                default:
                    quitter();
                    return;
            }
        }
    }

    private void connecter() {
        System.out.println("Entrez votre nom d'utilisateur : ");
        String nomUtilisateur = scanner.nextLine();
        System.out.println("Entrez votre mot de passe : ");
        String psw = scanner.nextLine();

        try {
            psConnexion.setString(1, nomUtilisateur);
            try (ResultSet rs = psConnexion.executeQuery()) {
                if (!rs.next()) {
                    System.out.println("Aucun utilisateur avec ce login");
                    return;
                }

                String pswC = rs.getString("mot_de_passe");
                if (!BCrypt.checkpw(psw, pswC)) {
                    System.out.println("Mot de passe incorrect");
                    return;
                }
                idUtilisateurConnecte = rs.getInt("id_client");
                menuClient();
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage().split("\n")[0]);
        }

    }

    private void inscrire() {
        System.out.println("Entrez votre nom d'utilisateur : ");
        String nomUtilisateur = scanner.nextLine();
        System.out.println("Entrez votre email : ");
        String email = scanner.nextLine();
        System.out.println("Entrez votre mot de passe : ");
        String psw = scanner.nextLine();
        try {
            psInscrire.setString(1, nomUtilisateur);
            psInscrire.setString(2, email);
            psInscrire.setString(3, BCrypt.hashpw(psw, BCrypt.gensalt()));
            try (ResultSet rs = psInscrire.executeQuery()) {
                if (rs.next()) {
                    System.out.println("L'inscription a été enregistrée");
                    idUtilisateurConnecte = rs.getInt(1);
                    menuClient();
                } else {
                    throw new InternalError();
                }
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage().split("\n")[0]);
        }
    }

    private void menuClient(){
        int choix = 0;
        while (true) {
            System.out.println("Que souhaitez-vous faire ?");
            System.out.println("1. Voir les événements d'une salle");
            System.out.println("2. Voir les événements d'un artiste");
            System.out.println("3. Voir les festivals");
            System.out.println("4. Voir ses réservations");
            System.out.println("Autre -> se déconnecter");
            System.out.println("Entrez votre choix");
            try {
                choix = Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException nbe) {
                System.out.println("Vous devez entrer un nombre");
                continue;
            }
            switch (choix) {
                case 1:
                    //TODO
                    break;
                case 2:
                    //TODO
                    break;
                case 3:
                    visualiserFestival();
                    break;
                case 4:
                    //TODO
                    break;
                default:
                    deconnecter();
                    return;

            }
        }
    }

    public void visualiserFestival(){
        try (ResultSet rsd = psVisualiserFestival.executeQuery()) {
            if (!rsd.next()) {
                System.out.println("Aucun festival prévu");
            } else {
                do {
                    System.out.println(rsd.getInt("id_festival") + "\t" + rsd.getString("nom") + " du " + rsd.getDate("date_debut") + " au "
                            + rsd.getDate("date_fin") + " (prix total : " + rsd.getString("prix_total") + ")");
                } while (rsd.next());
                //TODO prévoir la possibilité de réserver pour touts les évébnements d'un festival
            }
        } catch (SQLException se) {
            System.out.println(se.getMessage().split("\n")[0]);
        }

    }

    private int lireNombre(String message) {
        while (true) {
            try {
                System.out.println(message);
                return Integer.parseInt(scanner.nextLine());

            } catch (NumberFormatException nfe) {
                System.out.println("Vous devez entrer un nombre");
            }
        }
    }

    private void deconnecter() {
        this.idUtilisateurConnecte = 0;
    }

    private void quitter() {
        try {
            connection.close();
        } catch (SQLException e) {
        }
        scanner.close();

    }
}


